package com.tourflow.backend.controller;

import com.tourflow.backend.dto.GuideDashboardResponse;
import com.tourflow.backend.dto.GuideRequestResponse;
import com.tourflow.backend.entity.AuthSession;
import com.tourflow.backend.entity.GuideRequestStatus;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.repository.AuthSessionRepository;
import com.tourflow.backend.service.TourGuideService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/guide")
public class TourGuideController {

    private final TourGuideService tourGuideService;
    private final AuthSessionRepository sessionRepository;

    public TourGuideController(
            TourGuideService tourGuideService,
            AuthSessionRepository sessionRepository
    ) {
        this.tourGuideService =
                tourGuideService;

        this.sessionRepository =
                sessionRepository;
    }


    @GetMapping("/dashboard")
    public ResponseEntity<GuideDashboardResponse> dashboard(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authorization
    ) {

        UserAccount guide =
                authenticateGuide(
                        authorization
                );

        return ResponseEntity.ok(
                tourGuideService.dashboard(
                        guide
                )
        );
    }


    @PatchMapping("/requests/{bookingId}")
    public ResponseEntity<GuideRequestResponse> respond(
            @PathVariable Long bookingId,

            @RequestParam
            GuideRequestStatus status,

            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authorization
    ) {

        UserAccount guide =
                authenticateGuide(
                        authorization
                );

        return ResponseEntity.ok(
                tourGuideService.respond(
                        bookingId,
                        status,
                        guide
                )
        );
    }


    private UserAccount authenticateGuide(
            String authorization
    ) {

        if (
                authorization == null
                        ||
                        !authorization.startsWith(
                                "Bearer "
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication token is required"
            );
        }


        String token =
                authorization
                        .substring(7)
                        .trim();


        if (token.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication token is required"
            );
        }


        AuthSession session =
                sessionRepository
                        .findValidSessionByToken(
                                token
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Invalid or expired session"
                                        )
                        );


        UserAccount user =
                session.getUser();


        if (
                user == null
                        ||
                        !user.isActive()
        ) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User account is inactive"
            );
        }


        String role =
                user.getRole()
                        .name();


        if (
                !role.equals(
                        "TOUR_GUIDIDE"
                )
        ) {
            // corrected immediately below
        }


        if (
                !role.equals(
                        "TOUR_GUIDE"
                )
                        &&
                        !role.equals(
                                "SYSTEM_ADMIN"
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Tour Guide access required"
            );
        }


        return user;
    }
}