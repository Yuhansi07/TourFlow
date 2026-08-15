package com.tourflow.backend.controller;

import com.tourflow.backend.dto.SiteManagerDashboardResponse;
import com.tourflow.backend.dto.TimeSlotRequest;
import com.tourflow.backend.dto.TimeSlotResponse;
import com.tourflow.backend.service.SiteManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/manager")
public class SiteManagerController {

    private final SiteManagerService siteManagerService;

    public SiteManagerController(
            SiteManagerService siteManagerService
    ) {
        this.siteManagerService =
                siteManagerService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<SiteManagerDashboardResponse> dashboard(
            @RequestParam Long siteId,
            @RequestParam(required = false) LocalDate date
    ) {
        return ResponseEntity.ok(
                siteManagerService.getDashboard(
                        siteId,
                        date
                )
        );
    }

    @GetMapping("/time-slots")
    public ResponseEntity<List<TimeSlotResponse>> timeSlots(
            @RequestParam Long siteId,
            @RequestParam(required = false) LocalDate date
    ) {
        return ResponseEntity.ok(
                siteManagerService.getTimeSlots(
                        siteId,
                        date
                )
        );
    }

    @PostMapping("/time-slots")
    public ResponseEntity<TimeSlotResponse> createTimeSlot(
            @RequestBody TimeSlotRequest request
    ) {
        return ResponseEntity.status(201)
                .body(
                        siteManagerService.createTimeSlot(
                                request
                        )
                );
    }

    @PutMapping("/time-slots/{id}")
    public ResponseEntity<TimeSlotResponse> updateTimeSlot(
            @PathVariable Long id,
            @RequestBody TimeSlotRequest request
    ) {
        return ResponseEntity.ok(
                siteManagerService.updateTimeSlot(
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/time-slots/{id}")
    public ResponseEntity<Void> deleteTimeSlot(
            @PathVariable Long id
    ) {
        siteManagerService.deleteTimeSlot(
                id
        );

        return ResponseEntity.noContent()
                .build();
    }
}
