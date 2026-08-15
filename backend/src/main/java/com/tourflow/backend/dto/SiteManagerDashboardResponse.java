package com.tourflow.backend.dto;

import java.time.LocalDate;

public record SiteManagerDashboardResponse(
        Long siteId,
        String siteName,
        String district,
        LocalDate date,
        Integer dailyCapacity,
        Integer currentVisitors,
        Long reservedVisitors,
        Long remainingCapacity,
        Integer occupancyPercent,
        String crowdLevel,
        Long confirmedBookings,
        Long checkedInBookings,
        Long checkedInVisitors
) {
}
