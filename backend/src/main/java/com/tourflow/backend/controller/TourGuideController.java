package com.tourflow.backend.controller;

import com.tourflow.backend.dto.GuideDashboardResponse;
import com.tourflow.backend.dto.GuideRequestResponse;
import com.tourflow.backend.entity.GuideRequestStatus;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;
import com.tourflow.backend.service.TourGuideService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


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


    /*
     * Tour Guide dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<GuideDashboardResponse> dashboard(
            @AuthenticationPrincipal UserAccount guide
    ) {

        requireTourGuide(
                guide
        );

        return ResponseEntity.ok(
                tourGuideService.dashboard(
                        guide
                )
        );
    }


    /*
     * Accept / Reject tourist guide request
     */
    @PatchMapping("/requests/{bookingId}")
    public ResponseEntity<GuideRequestResponse> respond(
            @PathVariable Long bookingId,
            @RequestParam GuideRequestStatus status,
            @AuthenticationPrincipal UserAccount guide
    ) {

        requireTourGuide(
                guide
        );

        return ResponseEntity.ok(
                tourGuideService.respond(
                        bookingId,
                        status,
                        guide
                )
        );
    }


    /*
     * Explicit role verification.
     *
     * Spring Security only checks that
     * the request is authenticated.
     *
     * Actual TOUR_GUIDE authorization
     * is verified here.
     */
    private void requireTourGuide(
            UserAccount user
    ) {

        if (user == null) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }


        UserRole role =
                user.getRole();


        if (
                role != UserRole.TOUR_GUIDE
                        &&
                        role != UserRole.SYSTEM_ADMIN
        ) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Tour Guide access required"
            );
        }
    }
}