package com.tourflow.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record TimeSlotRequest(
        Long siteId,
        LocalDate slotDate,
        LocalTime startTime,
        LocalTime endTime,
        Integer capacity,
        Boolean active
) {
}
