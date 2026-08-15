package com.tourflow.backend.dto;

import java.util.List;

public record MaintenanceDashboardResponse(
        Long siteId,
        String siteName,
        long total,
        long pending,
        long inProgress,
        long completed,
        List<MaintenanceTaskResponse> tasks
) {}
