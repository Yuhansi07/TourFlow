package com.tourflow.backend.dto;

import com.tourflow.backend.entity.EmergencyAlert;
import com.tourflow.backend.entity.EmergencySeverity;
import com.tourflow.backend.entity.EmergencyStatus;

import java.time.LocalDateTime;

public record EmergencyAlertResponse(
        Long id,
        Long siteId,
        String siteName,
        String title,
        String location,
        String description,
        EmergencySeverity severity,
        EmergencyStatus status,
        LocalDateTime reportedAt,
        LocalDateTime resolvedAt
) {
    public static EmergencyAlertResponse from(
            EmergencyAlert alert
    ) {
        return new EmergencyAlertResponse(
                alert.getId(),
                alert.getSite().getId(),
                alert.getSite().getName(),
                alert.getTitle(),
                alert.getLocation(),
                alert.getDescription(),
                alert.getSeverity(),
                alert.getStatus(),
                alert.getReportedAt(),
                alert.getResolvedAt()
        );
    }
}
