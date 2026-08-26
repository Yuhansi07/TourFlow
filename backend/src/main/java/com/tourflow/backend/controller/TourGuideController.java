package com.tourflow.backend.controller;

import com.tourflow.backend.dto.GuideDashboardResponse;
import com.tourflow.backend.dto.GuideRequestResponse;
import com.tourflow.backend.entity.GuideRequestStatus;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.service.TourGuideService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide")
public class TourGuideController {

    private final TourGuideService tourGuideService;

    public TourGuideController(
            TourGuideService tourGuideService
    ) {
        this.tourGuideService =
                tourGuideService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<GuideDashboardResponse> dashboard(
            @AuthenticationPrincipal UserAccount guide
    ) {

        return ResponseEntity.ok(
                tourGuideService.dashboard(
                        guide
                )
        );
    }

    @PatchMapping("/requests/{bookingId}")
    public ResponseEntity<GuideRequestResponse> respond(
            @PathVariable Long bookingId,
            @RequestParam GuideRequestStatus status,
            @AuthenticationPrincipal UserAccount guide
    ) {

        return ResponseEntity.ok(
                tourGuideService.respond(
                        bookingId,
                        status,
                        guide
                )
        );
    }
}