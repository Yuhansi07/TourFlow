package com.tourflow.backend.repository;

import com.tourflow.backend.entity.MaintenanceStatus;
import com.tourflow.backend.entity.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceTaskRepository
        extends JpaRepository<MaintenanceTask, Long> {

    List<MaintenanceTask>
    findBySiteIdOrderByCreatedAtDesc(Long siteId);

    long countBySiteIdAndStatus(
            Long siteId,
            MaintenanceStatus status
    );
}
