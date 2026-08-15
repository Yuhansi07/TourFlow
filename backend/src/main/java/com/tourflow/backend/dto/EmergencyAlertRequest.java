package com.tourflow.backend.dto;

import com.tourflow.backend.entity.EmergencySeverity;

public record EmergencyAlertRequest(
        Long siteId,
        String title,
        String location,
        String description,
        EmergencySeverity severity
) {}
