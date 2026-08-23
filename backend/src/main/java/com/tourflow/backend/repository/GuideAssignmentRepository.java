package com.tourflow.backend.repository;

import com.tourflow.backend.entity.GuideAssignment;
import com.tourflow.backend.entity.GuideRequestStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GuideAssignmentRepository
        extends JpaRepository<GuideAssignment, Long> {


    Optional<GuideAssignment>
    findByBookingIdAndGuideId(
            Long bookingId,
            Long guideId
    );


    List<GuideAssignment>
    findByBookingId(
            Long bookingId
    );


    void deleteByBookingId(
            Long bookingId
    );


    long countByGuideIdAndStatus(
            Long guideId,
            GuideRequestStatus status
    );


    @Query("""
            select assignment
            from GuideAssignment assignment
            where assignment.guide.id = :guideId
            order by
                assignment.booking.visitDate asc,
                assignment.booking.visitTime asc
            """)
    List<GuideAssignment> findForGuide(
            @Param("guideId")
            Long guideId
    );


    @Query("""
            select assignment
            from GuideAssignment assignment
            where assignment.booking.user.id = :touristId
            order by assignment.updatedAt desc
            """)
    List<GuideAssignment> findForTourist(
            @Param("touristId")
            Long touristId
    );
}