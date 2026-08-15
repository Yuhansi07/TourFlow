package com.tourflow.backend.controller;

import com.tourflow.backend.dto.EmergencyAlertRequest;
import com.tourflow.backend.dto.EmergencyAlertResponse;
import com.tourflow.backend.dto.SafetyDashboardResponse;
import com.tourflow.backend.entity.EmergencyStatus;
import com.tourflow.backend.service.SafetyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {

    private final SafetyService safetyService;

    public SafetyController(
            SafetyService safetyService
    ) {
        this.safetyService = safetyService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<SafetyDashboardResponse> dashboard(
            @RequestParam Long siteId
    ) {
        return ResponseEntity.ok(
                safetyService.dashboard(siteId)
        );
    }

    @PostMapping("/alerts")
    public ResponseEntity<EmergencyAlertResponse> create(
            @RequestBody EmergencyAlertRequest request
    ) {
        return ResponseEntity.status(201)
                .body(
                        safetyService.create(request)
                );
    }

    @PatchMapping("/alerts/{id}/status")
    public ResponseEntity<EmergencyAlertResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam EmergencyStatus status
    ) {
        return ResponseEntity.ok(
                safetyService.updateStatus(
                        id,
                        status
                )
        );
    }
}
