package com.tourflow.backend.dto;

import com.tourflow.backend.entity.Booking;
import com.tourflow.backend.entity.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record EntranceBookingResponse(
        Long id,
        String bookingReference,
        String touristName,
        String touristEmail,
        Long siteId,
        String siteName,
        String district,
        LocalDate visitDate,
        LocalTime visitTime,
        Integer visitorCount,
        BookingStatus status,
        LocalDateTime checkedInAt
) {
    public static EntranceBookingResponse from(
            Booking booking
    ) {
        return new EntranceBookingResponse(
                booking.getId(),
                booking.getBookingReference(),
                booking.getUser().getFullName(),
                booking.getUser().getEmail(),
                booking.getSite().getId(),
                booking.getSite().getName(),
                booking.getSite().getDistrict(),
                booking.getVisitDate(),
                booking.getVisitTime(),
                booking.getVisitorCount(),
                booking.getStatus(),
                booking.getCheckedInAt()
        );
    }
}
