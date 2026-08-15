package com.tourflow.backend.dto;

import java.time.LocalDateTime;

public record AuthResponse(
        String token,
        LocalDateTime expiresAt,
        UserResponse user
) {}
