package com.tourflow.backend.controller;

import com.tourflow.backend.dto.*;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.service.BookingService;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(
        @AuthenticationPrincipal UserAccount user,
        @Valid @RequestBody CreateBookingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookingService.createBooking(user, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> mine(
        @AuthenticationPrincipal UserAccount user
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(
        @AuthenticationPrincipal UserAccount user,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(user, id));
    }
}
