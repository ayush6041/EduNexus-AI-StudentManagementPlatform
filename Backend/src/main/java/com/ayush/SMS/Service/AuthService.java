package com.ayush.SMS.Service;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Entity.Role;
import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Exception.ApiException;
import com.ayush.SMS.Repository.UserRepo;
import com.ayush.SMS.Security.JwtService;
import com.ayush.SMS.Security.PasswordPolicy;
import com.ayush.SMS.Security.RateLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Deliberately NOT @Transactional: failed-attempt counters must be persisted
 * even though the method then throws.
 */
@Service
public class AuthService {

    private static final long FIFTEEN_MIN = 15 * 60_000L;

    private final UserRepo userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final RateLimiter rateLimiter;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();
    private final String dummyHash;

    @Value("${app.login.max-failed-attempts:5}")
    private int maxFailed;
    @Value("${app.login.lock-minutes:15}")
    private long lockMinutes;
    @Value("${app.otp.expiry-minutes:10}")
    private long otpMinutes;
    @Value("${app.otp.max-attempts:5}")
    private int otpMaxAttempts;

    public AuthService(UserRepo userRepo, PasswordEncoder encoder, JwtService jwtService,
                       RateLimiter rateLimiter, EmailService emailService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.rateLimiter = rateLimiter;
        this.emailService = emailService;
        this.dummyHash = encoder.encode("not-a-real-password");
    }

    public AuthResponse login(LoginRequest request, String ip) {
        String identifier = request.identifier().trim().toLowerCase();
        rateLimiter.check("login:" + ip + ":" + identifier, 10, 60_000);
        rateLimiter.check("login-ip:" + ip, 60, 60_000);

        User user = (identifier.contains("@")
                ? userRepo.findByEmailIgnoreCase(identifier)
                : userRepo.findByUsernameIgnoreCase(identifier)).orElse(null);

        if (user == null || !user.isEnabled()) {
            encoder.matches(request.password(), dummyHash);
            throw invalidCredentials();
        }

        LocalDateTime now = LocalDateTime.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            long minutes = Math.max(1, Duration.between(now, user.getLockedUntil()).toMinutes() + 1);
            throw new ApiException(HttpStatus.LOCKED, "ACCOUNT_LOCKED",
                    "Too many failed attempts. Try again in about " + minutes + " minute(s).");
        }

        if (!encoder.matches(request.password(), user.getPassword())) {
            int failures = user.getFailedAttempts() + 1;
            if (failures >= maxFailed) {
                user.setLockedUntil(now.plusMinutes(lockMinutes));
                failures = 0;
            }
            user.setFailedAttempts(failures);
            userRepo.save(user);
            throw invalidCredentials();
        }

        if (user.isMustChangePassword() && user.getTempPasswordExpiry() != null
                && user.getTempPasswordExpiry().isBefore(now)) {
            throw ApiException.forbidden(
                    "Your temporary password has expired. Please ask your teacher or admin to resend your credentials.");
        }

        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepo.save(user);
        return toResponse(user);
    }

    public AuthResponse me(User principal) {
        User user = userRepo.findById(principal.getId()).orElseThrow(() -> ApiException.unauthorized("Account not found"));
        return toResponse(user);
    }

    public AuthResponse changePassword(User principal, ChangePasswordRequest request) {
        rateLimiter.check("chgpw:" + principal.getId(), 10, FIFTEEN_MIN);
        User user = userRepo.findById(principal.getId()).orElseThrow(() -> ApiException.unauthorized("Account not found"));

        if (!encoder.matches(request.currentPassword(), user.getPassword())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        PasswordPolicy.validate(request.newPassword());
        if (encoder.matches(request.newPassword(), user.getPassword())) {
            throw ApiException.badRequest("New password must be different from the current password");
        }

        user.setPassword(encoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        user.setTempPasswordExpiry(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        clearOtp(user);
        userRepo.save(user);
        return toResponse(user);
    }

    public void forgotPassword(String email, String ip) {
        String normalized = email.trim().toLowerCase();
        rateLimiter.check("forgot-ip:" + ip, 10, FIFTEEN_MIN);
        rateLimiter.check("forgot:" + normalized, 3, FIFTEEN_MIN);

        userRepo.findByEmailIgnoreCase(normalized).filter(User::isEnabled).ifPresent(user -> {
            String otp = String.format("%06d", random.nextInt(1_000_000));
            user.setResetOtpHash(encoder.encode(otp));
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpMinutes));
            user.setOtpAttempts(0);
            userRepo.save(user);
            emailService.sendOtp(user.getEmail(), otp, otpMinutes);
        });
        // Always succeed silently so the endpoint cannot be used to discover registered emails.
    }

    public void resetPassword(ResetPasswordRequest request, String ip) {
        rateLimiter.check("reset-ip:" + ip, 20, FIFTEEN_MIN);
        rateLimiter.check("reset:" + request.email().trim().toLowerCase(), 10, FIFTEEN_MIN);
        PasswordPolicy.validate(request.newPassword());

        User user = userRepo.findByEmailIgnoreCase(request.email().trim()).orElseThrow(this::invalidOtp);

        if (user.getResetOtpHash() == null || user.getOtpExpiry() == null
                || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw invalidOtp();
        }
        if (user.getOtpAttempts() >= otpMaxAttempts) {
            clearOtp(user);
            userRepo.save(user);
            throw invalidOtp();
        }
        if (!encoder.matches(request.otp().trim(), user.getResetOtpHash())) {
            user.setOtpAttempts(user.getOtpAttempts() + 1);
            if (user.getOtpAttempts() >= otpMaxAttempts) {
                clearOtp(user);
            }
            userRepo.save(user);
            throw invalidOtp();
        }

        user.setPassword(encoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        user.setTempPasswordExpiry(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        clearOtp(user);
        userRepo.save(user);
    }

    private void clearOtp(User user) {
        user.setResetOtpHash(null);
        user.setOtpExpiry(null);
        user.setOtpAttempts(0);
    }

    private ApiException invalidCredentials() {
        return ApiException.unauthorized("Invalid username/email or password");
    }

    private ApiException invalidOtp() {
        return ApiException.badRequest("Invalid or expired code");
    }

    private AuthResponse toResponse(User user) {
        String name;
        if (user.getRole() == Role.STUDENT && user.getStudent() != null) {
            name = user.getStudent().getName();
        } else if (user.getRole() == Role.TEACHER && user.getTeacher() != null) {
            name = user.getTeacher().getName();
        } else {
            name = "Super Admin";
        }
        return new AuthResponse(jwtService.generateToken(user), user.getUsername(), user.getEmail(), name,
                user.getRole().name(), user.isMustChangePassword());
    }
}
