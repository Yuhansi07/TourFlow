package com.tourflow.backend.controller;

import com.tourflow.backend.dto.GuideOptionResponse;
import com.tourflow.backend.dto.GuideRequestCreateRequest;
import com.tourflow.backend.dto.TouristGuideRequestResponse;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.service.TouristGuideService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/tourist/guides")
public class TouristGuideController {

    private final TouristGuideService touristGuideService;


    public TouristGuideController(
            TouristGuideService touristGuideService
    ) {
        this.touristGuideService =
                touristGuideService;
    }


    @GetMapping("/available")
    public ResponseEntity<List<GuideOptionResponse>> availableGuides(
            @RequestParam Long siteId
    ) {
        return ResponseEntity.ok(
                touristGuideService
                        .getAvailableGuides(
                                siteId
                        )
        );
    }


    @GetMapping("/requests")
    public ResponseEntity<List<TouristGuideRequestResponse>> myRequests(
            @AuthenticationPrincipal UserAccount tourist
    ) {
        return ResponseEntity.ok(
                touristGuideService
                        .getMyRequests(
                                tourist
                        )
        );
    }


    @PostMapping("/requests")
    public ResponseEntity<TouristGuideRequestResponse> requestGuide(
            @AuthenticationPrincipal UserAccount tourist,
            @RequestBody GuideRequestCreateRequest request
    ) {
        return ResponseEntity.status(201)
                .body(
                        touristGuideService
                                .requestGuide(
                                        tourist,
                                        request
                                )
                );
    }
}