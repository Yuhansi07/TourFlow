package com.tourflow.backend.service;

import com.tourflow.backend.dto.*;
import com.tourflow.backend.entity.*;
import com.tourflow.backend.exception.ResourceNotFoundException;
import com.tourflow.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TouristSiteRepository touristSiteRepository;

    public BookingService(
        BookingRepository bookingRepository,
        TouristSiteRepository touristSiteRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.touristSiteRepository = touristSiteRepository;
    }

    @Transactional
    public BookingResponse createBooking(
        UserAccount user,
        CreateBookingRequest request
    ) {
        if (user.getRole() != UserRole.TOURIST) {
            throw new IllegalArgumentException("Only tourists can create bookings");
        }

        TouristSite site = touristSiteRepository.findById(request.siteId())
            .orElseThrow(() -> new ResourceNotFoundException("Tourist site not found"));

        if (site.getStatus() != SiteStatus.OPEN) {
            throw new IllegalArgumentException("This site is not open for bookings");
        }

        Long reserved = bookingRepository.reservedVisitors(
            site.getId(),
            request.visitDate(),
            BookingStatus.CANCELLED
        );

        if (reserved + request.visitorCount() > site.getDailyCapacity()) {
            long available = Math.max(0, site.getDailyCapacity() - reserved);
            throw new IllegalArgumentException(
                "Not enough capacity. Available places: " + available
            );
        }

        Booking booking = new Booking();
        booking.setBookingReference(createReference(request.visitDate()));
        booking.setUser(user);
        booking.setSite(site);
        booking.setVisitDate(request.visitDate());
        booking.setVisitTime(request.visitTime());
        booking.setVisitorCount(request.visitorCount());
        booking.setStatus(BookingStatus.CONFIRMED);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(UserAccount user) {
        return bookingRepository
            .findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(BookingResponse::from)
            .toList();
    }

    @Transactional
    public BookingResponse cancelBooking(UserAccount user, Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You cannot access this booking");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    private String createReference(LocalDate date) {
        return "TF-" +
            date.format(DateTimeFormatter.BASIC_ISO_DATE) +
            "-" +
            UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
    }
}
