package com.tourflow.backend.repository;

import com.tourflow.backend.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TimeSlotRepository
        extends JpaRepository<TimeSlot, Long> {

    @Query("""
        select t
        from TimeSlot t
        where t.site.id = :siteId
          and t.slotDate = :slotDate
        order by t.startTime asc
        """)
    List<TimeSlot> findForSiteAndDate(
            @Param("siteId") Long siteId,
            @Param("slotDate") LocalDate slotDate
    );
}
