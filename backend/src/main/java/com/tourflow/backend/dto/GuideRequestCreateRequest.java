package com.tourflow.backend.dto;

import jakarta.validation.constraints.NotNull;

public record GuideRequestCreateRequest(

        @NotNull(message = "Booking is required")
        Long bookingId,

        @NotNull(message = "Guide is required")
        Long guideId
) {
}