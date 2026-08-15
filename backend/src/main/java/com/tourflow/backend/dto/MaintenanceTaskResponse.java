package com.tourflow.backend.dto;

import com.tourflow.backend.entity.MaintenancePriority;
import com.tourflow.backend.entity.MaintenanceStatus;
import com.tourflow.backend.entity.MaintenanceTask;

import java.time.LocalDateTime;

public record MaintenanceTaskResponse(
        Long id,
        Long siteId,
        String siteName,
        String title,
        String location,
        String description,
        MaintenancePriority priority,
        MaintenanceStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MaintenanceTaskResponse from(
            MaintenanceTask task
    ) {
        return new MaintenanceTaskResponse(
                task.getId(),
                task.getSite().getId(),
                task.getSite().getName(),
                task.getTitle(),
                task.getLocation(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
