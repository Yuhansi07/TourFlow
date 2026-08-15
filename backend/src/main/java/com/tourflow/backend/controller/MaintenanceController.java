package com.tourflow.backend.controller;

import com.tourflow.backend.dto.MaintenanceDashboardResponse;
import com.tourflow.backend.dto.MaintenanceTaskRequest;
import com.tourflow.backend.dto.MaintenanceTaskResponse;
import com.tourflow.backend.entity.MaintenanceStatus;
import com.tourflow.backend.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(
            MaintenanceService maintenanceService
    ) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<MaintenanceDashboardResponse> dashboard(
            @RequestParam Long siteId
    ) {
        return ResponseEntity.ok(
                maintenanceService.dashboard(siteId)
        );
    }

    @PostMapping("/tasks")
    public ResponseEntity<MaintenanceTaskResponse> create(
            @RequestBody MaintenanceTaskRequest request
    ) {
        return ResponseEntity.status(201)
                .body(
                        maintenanceService.create(request)
                );
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<MaintenanceTaskResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceStatus status
    ) {
        return ResponseEntity.ok(
                maintenanceService.updateStatus(
                        id,
                        status
                )
        );
    }
}
