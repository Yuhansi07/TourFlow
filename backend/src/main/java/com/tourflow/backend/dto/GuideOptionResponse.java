package com.tourflow.backend.dto;

public record GuideOptionResponse(
        Long id,
        String fullName,
        String email,
        String language,
        double rating
) {
}