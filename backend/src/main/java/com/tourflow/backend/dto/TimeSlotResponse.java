package com.tourflow.backend.dto;

import com.tourflow.backend.entity.TimeSlot;

import java.time.LocalDate;
import java.time.LocalTime;

public record TimeSlotResponse(
        Long id,
        Long siteId,
        String siteName,
        LocalDate slotDate,
        LocalTime startTime,
        LocalTime endTime,
        Integer capacity,
        Long reservedVisitors,
        Long remainingPlaces,
        Integer utilizationPercent,
        boolean active
) {
    public static TimeSlotResponse from(
            TimeSlot slot,
            long reservedVisitors
    ) {
        long remaining =
                Math.max(
                        0,
                        slot.getCapacity()
                                - reservedVisitors
                );

        int utilization =
                slot.getCapacity() <= 0
                        ? 0
                        : (int) Math.round(
                                (
                                        reservedVisitors
                                                * 100.0
                                )
                                        / slot.getCapacity()
                        );

        return new TimeSlotResponse(
                slot.getId(),
                slot.getSite().getId(),
                slot.getSite().getName(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getCapacity(),
                reservedVisitors,
                remaining,
                utilization,
                slot.isActive()
        );
    }
}
