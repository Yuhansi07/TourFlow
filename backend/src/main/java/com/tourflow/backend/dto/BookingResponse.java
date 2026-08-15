package com.tourflow.backend.dto;

import com.tourflow.backend.entity.*;
import java.time.*;

public record BookingResponse(
    Long id,
    String bookingReference,
    Long siteId,
    String siteName,
    String district,
    LocalDate visitDate,
    LocalTime visitTime,
    Integer visitorCount,
    BookingStatus status,
    LocalDateTime createdAt
) {
    public static BookingResponse from(Booking b) {
        return new BookingResponse(
            b.getId(),
            b.getBookingReference(),
            b.getSite().getId(),
            b.getSite().getName(),
            b.getSite().getDistrict(),
            b.getVisitDate(),
            b.getVisitTime(),
            b.getVisitorCount(),
            b.getStatus(),
            b.getCreatedAt()
        );
    }
}
