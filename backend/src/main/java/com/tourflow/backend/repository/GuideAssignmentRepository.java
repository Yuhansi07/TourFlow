package com.tourflow.backend.repository;

import com.tourflow.backend.entity.GuideAssignment;
import com.tourflow.backend.entity.GuideRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuideAssignmentRepository
        extends JpaRepository<GuideAssignment, Long> {

    Optional<GuideAssignment>
    findByBookingIdAndGuideId(
            Long bookingId,
            Long guideId
    );

    long countByGuideIdAndStatus(
            Long guideId,
            GuideRequestStatus status
    );
}
