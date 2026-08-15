package com.tourflow.backend.controller;

import com.tourflow.backend.dto.*;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization
    ) {
        authService.logout(extractToken(authorization));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @AuthenticationPrincipal UserAccount user
    ) {
        return ResponseEntity.ok(UserResponse.from(user));
    }

    private String extractToken(String authorization) {
        if (authorization == null
                || !authorization.startsWith("Bearer ")) {
            return null;
        }

        return authorization.substring(7).trim();
    }
}
