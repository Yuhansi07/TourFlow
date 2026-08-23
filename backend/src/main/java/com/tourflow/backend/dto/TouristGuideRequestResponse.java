package com.tourflow.backend.dto;

import com.tourflow.backend.entity.GuideRequestStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record TouristGuideRequestResponse(

        Long assignmentId,

        Long bookingId,

        String bookingReference,

        Long guideId,

        String guideName,

        String destination,

        LocalDate visitDate,

        LocalTime visitTime,

        Integer groupSize,

        String language,

        GuideRequestStatus requestStatus
) {
}