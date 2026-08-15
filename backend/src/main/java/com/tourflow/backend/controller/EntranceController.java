package com.tourflow.backend.controller;

import com.tourflow.backend.dto.EntranceBookingResponse;
import com.tourflow.backend.service.EntranceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/entrance")
public class EntranceController {

    private final EntranceService entranceService;

    public EntranceController(
            EntranceService entranceService
    ) {
        this.entranceService =
                entranceService;
    }

    @GetMapping("/bookings/{reference}")
    public ResponseEntity<EntranceBookingResponse> findBooking(
            @PathVariable String reference
    ) {
        return ResponseEntity.ok(
                entranceService.findBooking(
                        reference
                )
        );
    }

    @PatchMapping("/bookings/{reference}/check-in")
    public ResponseEntity<EntranceBookingResponse> checkIn(
            @PathVariable String reference
    ) {
        return ResponseEntity.ok(
                entranceService.checkIn(
                        reference
                )
        );
    }
}
