package com.tourflow.backend.dto;

import com.tourflow.backend.entity.GuideRequestStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record GuideRequestResponse(
        Long bookingId,
        String bookingReference,
        String touristName,
        String destination,
        LocalDate visitDate,
        LocalTime visitTime,
        Integer groupSize,
        String language,
        GuideRequestStatus requestStatus
) {}
