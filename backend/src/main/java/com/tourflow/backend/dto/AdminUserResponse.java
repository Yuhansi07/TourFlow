package com.tourflow.backend.dto;

import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;

import java.time.LocalDateTime;

public record AdminUserResponse(

        Long id,

        String fullName,

        String email,

        UserRole role,

        boolean active,

        LocalDateTime createdAt

) {

    public static AdminUserResponse from(
            UserAccount user
    ) {

        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}