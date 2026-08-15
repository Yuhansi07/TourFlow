package com.tourflow.backend.dto;

import com.tourflow.backend.entity.MaintenancePriority;

public record MaintenanceTaskRequest(
        Long siteId,
        String title,
        String location,
        String description,
        MaintenancePriority priority
) {}
