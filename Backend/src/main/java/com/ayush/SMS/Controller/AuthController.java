package com.ayush.SMS.Controller;

import com.ayush.SMS.DTO.Dtos.*;
import com.ayush.SMS.Security.CurrentUser;
import com.ayush.SMS.Service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        return authService.login(request, http.getRemoteAddr());
    }

    @GetMapping("/me")
    public AuthResponse me() {
        return authService.me(CurrentUser.get());
    }

    @PostMapping("/change-password")
    public AuthResponse changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return authService.changePassword(CurrentUser.get(), request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest http) {
        authService.forgotPassword(request.email(), http.getRemoteAddr());
        return new MessageResponse("If an account exists for that email, a 6-digit code has been sent.");
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletRequest http) {
        authService.resetPassword(request, http.getRemoteAddr());
        return new MessageResponse("Password updated. You can now sign in.");
    }
}
