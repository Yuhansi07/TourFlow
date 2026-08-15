package com.tourflow.backend.controller;

import com.tourflow.backend.dto.AdminDashboardResponse;
import com.tourflow.backend.service.AdminDashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService service;

    public AdminDashboardController(
            AdminDashboardService service
    ) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard(
            Authentication authentication
    ) {
        boolean systemAdmin =
                authentication != null
                && authentication.getAuthorities()
                    .stream()
                    .anyMatch(authority ->
                            "ROLE_SYSTEM_ADMIN".equals(
                                    authority.getAuthority()
                            )
                    );

        if (!systemAdmin) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(
                service.getDashboard()
        );
    }
}
