package com.tourflow.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 120)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        @Size(max = 190)
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72,
              message = "Password must contain 8 to 72 characters")
        String password
) {}
