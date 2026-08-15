package com.tourflow.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AdminDashboardResponse(
        long touristSites,
        long totalUsers,
        long activeOfficers,
        long systemAlerts,
        List<RecentActivity> recentActivity,
        SystemHealth systemHealth
) {
    public record RecentActivity(
            String type,
            String title,
            String detail,
            LocalDateTime occurredAt
    ) {}

    public record SystemHealth(
            String api,
            String database,
            String authentication,
            String notifications
    ) {}
}
