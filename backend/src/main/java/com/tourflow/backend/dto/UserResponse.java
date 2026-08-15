package com.tourflow.backend.dto;

import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        UserRole role
) {
    public static UserResponse from(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
