package com.tourflow.backend.dto;

import java.util.List;

public record SafetyDashboardResponse(
        Long siteId,
        String siteName,
        Integer currentVisitors,
        long activeAlerts,
        long criticalAlerts,
        long resolvedToday,
        List<EmergencyAlertResponse> alerts
) {}
