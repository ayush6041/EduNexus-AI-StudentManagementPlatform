package com.ayush.SMS.Security;

import com.ayush.SMS.Entity.User;
import com.ayush.SMS.Repository.UserRepo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

/**
 * Validates the bearer token, reloads the user (so disabled accounts / role changes
 * take effect immediately) and blocks every endpoint except change-password while
 * the account still has a temporary password.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PATHS =
            Set.of("/auth/login", "/auth/forgot-password", "/auth/reset-password");

    private static final Set<String> ALLOWED_WHILE_CHANGING = Set.of("/auth/change-password", "/auth/me");

    private final JwtService jwtService;
    private final UserRepo userRepo;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepo userRepo) {
        this.jwtService = jwtService;
        this.userRepo = userRepo;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod()) || PUBLIC_PATHS.contains(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            User user;
            try {
                Claims claims = jwtService.parse(header.substring(7).trim());
                user = userRepo.findByEmailIgnoreCase(claims.getSubject()).orElse(null);

                if (user == null || !user.isEnabled()
                        || !user.getRole().name().equals(claims.get("role", String.class))
                        || issuedBeforePasswordChange(claims, user)) {
                    ErrorWriter.write(response, 401, "UNAUTHORIZED", "Session is no longer valid. Please sign in again.");
                    return;
                }
            } catch (JwtException | IllegalArgumentException ex) {
                ErrorWriter.write(response, 401, "UNAUTHORIZED", "Session expired. Please sign in again.");
                return;
            }

            if (user.isMustChangePassword() && !ALLOWED_WHILE_CHANGING.contains(request.getRequestURI())) {
                ErrorWriter.write(response, 403, "PASSWORD_CHANGE_REQUIRED",
                        "You must change your temporary password before continuing.");
                return;
            }

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        chain.doFilter(request, response);
    }

    private boolean issuedBeforePasswordChange(Claims claims, User user) {
        if (user.getPasswordChangedAt() == null || claims.getIssuedAt() == null) {
            return false;
        }
        Instant changedAt = user.getPasswordChangedAt().atZone(ZoneId.systemDefault())
                .toInstant().truncatedTo(ChronoUnit.SECONDS);
        return claims.getIssuedAt().toInstant().isBefore(changedAt);
    }
}
