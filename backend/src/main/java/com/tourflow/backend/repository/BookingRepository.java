package com.tourflow.backend.repository;

import com.tourflow.backend.entity.Booking;
import com.tourflow.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<Booking> findByBookingReferenceIgnoreCase(
            String bookingReference
    );

    List<Booking>
    findByStatusOrderByVisitDateAscVisitTimeAsc(
            BookingStatus status
    );

    @Query("""
        select coalesce(sum(b.visitorCount), 0)
        from Booking b
        where b.site.id = :siteId
          and b.visitDate = :visitDate
          and b.status <> :cancelledStatus
        """)
    Long reservedVisitors(
            @Param("siteId") Long siteId,
            @Param("visitDate") LocalDate visitDate,
            @Param("cancelledStatus") BookingStatus cancelledStatus
    );

    @Query("""
        select coalesce(sum(b.visitorCount), 0)
        from Booking b
        where b.site.id = :siteId
          and b.visitDate = :visitDate
          and b.visitTime >= :startTime
          and b.visitTime < :endTime
          and b.status <> :cancelledStatus
        """)
    Long reservedVisitorsForSlot(
            @Param("siteId") Long siteId,
            @Param("visitDate") LocalDate visitDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("cancelledStatus") BookingStatus cancelledStatus
    );

    @Query("""
        select count(b)
        from Booking b
        where b.site.id = :siteId
          and b.visitDate = :visitDate
          and b.status = :status
        """)
    Long countBySiteDateAndStatus(
            @Param("siteId") Long siteId,
            @Param("visitDate") LocalDate visitDate,
            @Param("status") BookingStatus status
    );

    @Query("""
        select coalesce(sum(b.visitorCount), 0)
        from Booking b
        where b.site.id = :siteId
          and b.visitDate = :visitDate
          and b.status = :status
        """)
    Long visitorsBySiteDateAndStatus(
            @Param("siteId") Long siteId,
            @Param("visitDate") LocalDate visitDate,
            @Param("status") BookingStatus status
    );
}
