package com.tourflow.backend.service;

import com.tourflow.backend.dto.EntranceBookingResponse;
import com.tourflow.backend.entity.Booking;
import com.tourflow.backend.entity.BookingStatus;
import com.tourflow.backend.entity.TouristSite;
import com.tourflow.backend.exception.ResourceNotFoundException;
import com.tourflow.backend.repository.BookingRepository;
import com.tourflow.backend.repository.TouristSiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EntranceService {

    private final BookingRepository bookingRepository;
    private final TouristSiteRepository touristSiteRepository;

    public EntranceService(
            BookingRepository bookingRepository,
            TouristSiteRepository touristSiteRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.touristSiteRepository = touristSiteRepository;
    }

    @Transactional(readOnly = true)
    public EntranceBookingResponse findBooking(
            String reference
    ) {
        return EntranceBookingResponse.from(
                findByReference(reference)
        );
    }

    @Transactional
    public EntranceBookingResponse checkIn(
            String reference
    ) {
        Booking booking =
                findByReference(reference);

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new IllegalArgumentException(
                    "This booking has already been checked in"
            );
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "A cancelled booking cannot be checked in"
            );
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException(
                    "This booking is already completed"
            );
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException(
                    "Only confirmed bookings can be checked in"
            );
        }

        TouristSite site =
                booking.getSite();

        int currentVisitors =
                site.getCurrentVisitors() == null
                        ? 0
                        : site.getCurrentVisitors();

        int incomingVisitors =
                booking.getVisitorCount();

        int newVisitorTotal =
                currentVisitors
                        + incomingVisitors;

        if (newVisitorTotal > site.getDailyCapacity()) {
            throw new IllegalArgumentException(
                    "Check-in would exceed site capacity"
            );
        }

        site.setCurrentVisitors(
                newVisitorTotal
        );

        touristSiteRepository.save(site);

        booking.setStatus(
                BookingStatus.CHECKED_IN
        );

        booking.setCheckedInAt(
                LocalDateTime.now()
        );

        Booking saved =
                bookingRepository.save(
                        booking
                );

        return EntranceBookingResponse.from(
                saved
        );
    }

    private Booking findByReference(
            String reference
    ) {
        if (reference == null
                || reference.isBlank()) {
            throw new IllegalArgumentException(
                    "Booking reference is required"
            );
        }

        String normalized =
                reference
                        .trim()
                        .toUpperCase();

        return bookingRepository
                .findByBookingReferenceIgnoreCase(
                        normalized
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found: "
                                        + normalized
                        )
                );
    }
}
