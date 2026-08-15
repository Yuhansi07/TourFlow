package com.tourflow.backend.repository;

import com.tourflow.backend.entity.EmergencyAlert;
import com.tourflow.backend.entity.EmergencySeverity;
import com.tourflow.backend.entity.EmergencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EmergencyAlertRepository
        extends JpaRepository<EmergencyAlert, Long> {

    List<EmergencyAlert>
    findBySiteIdOrderByReportedAtDesc(Long siteId);

    long countBySiteIdAndStatusNot(
            Long siteId,
            EmergencyStatus status
    );

    long countBySiteIdAndSeverityAndStatusNot(
            Long siteId,
            EmergencySeverity severity,
            EmergencyStatus status
    );

    long countBySiteIdAndStatusAndResolvedAtAfter(
            Long siteId,
            EmergencyStatus status,
            LocalDateTime time
    );
}
