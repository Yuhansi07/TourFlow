package com.tourflow.backend.service;

import com.tourflow.backend.dto.SiteManagerDashboardResponse;
import com.tourflow.backend.dto.TimeSlotRequest;
import com.tourflow.backend.dto.TimeSlotResponse;
import com.tourflow.backend.entity.BookingStatus;
import com.tourflow.backend.entity.TimeSlot;
import com.tourflow.backend.entity.TouristSite;
import com.tourflow.backend.exception.ResourceNotFoundException;
import com.tourflow.backend.repository.BookingRepository;
import com.tourflow.backend.repository.TimeSlotRepository;
import com.tourflow.backend.repository.TouristSiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SiteManagerService {

    private final TouristSiteRepository touristSiteRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;

    public SiteManagerService(
            TouristSiteRepository touristSiteRepository,
            BookingRepository bookingRepository,
            TimeSlotRepository timeSlotRepository
    ) {
        this.touristSiteRepository = touristSiteRepository;
        this.bookingRepository = bookingRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    @Transactional(readOnly = true)
    public SiteManagerDashboardResponse getDashboard(
            Long siteId,
            LocalDate date
    ) {
        TouristSite site =
                requireSite(siteId);

        LocalDate selectedDate =
                date == null
                        ? LocalDate.now()
                        : date;

        long reservedVisitors =
                bookingRepository.reservedVisitors(
                        siteId,
                        selectedDate,
                        BookingStatus.CANCELLED
                );

        long confirmedBookings =
                bookingRepository.countBySiteDateAndStatus(
                        siteId,
                        selectedDate,
                        BookingStatus.CONFIRMED
                );

        long checkedInBookings =
                bookingRepository.countBySiteDateAndStatus(
                        siteId,
                        selectedDate,
                        BookingStatus.CHECKED_IN
                );

        long checkedInVisitors =
                bookingRepository.visitorsBySiteDateAndStatus(
                        siteId,
                        selectedDate,
                        BookingStatus.CHECKED_IN
                );

        int currentVisitors =
                site.getCurrentVisitors() == null
                        ? 0
                        : site.getCurrentVisitors();

        int dailyCapacity =
                site.getDailyCapacity();

        long remainingCapacity =
                Math.max(
                        0,
                        dailyCapacity
                                - reservedVisitors
                );

        int occupancyPercent =
                dailyCapacity <= 0
                        ? 0
                        : (int) Math.round(
                                currentVisitors
                                        * 100.0
                                        / dailyCapacity
                        );

        return new SiteManagerDashboardResponse(
                site.getId(),
                site.getName(),
                site.getDistrict(),
                selectedDate,
                dailyCapacity,
                currentVisitors,
                reservedVisitors,
                remainingCapacity,
                occupancyPercent,
                crowdLevel(occupancyPercent),
                confirmedBookings,
                checkedInBookings,
                checkedInVisitors
        );
    }

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getTimeSlots(
            Long siteId,
            LocalDate date
    ) {
        requireSite(siteId);

        LocalDate selectedDate =
                date == null
                        ? LocalDate.now()
                        : date;

        return timeSlotRepository
                .findForSiteAndDate(
                        siteId,
                        selectedDate
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TimeSlotResponse createTimeSlot(
            TimeSlotRequest request
    ) {
        validateRequest(request);

        TouristSite site =
                requireSite(
                        request.siteId()
                );

        long reserved =
                reservedForRequest(
                        request
                );

        if (reserved > request.capacity()) {
            throw new IllegalArgumentException(
                    "Slot capacity cannot be lower than existing reserved visitors: "
                            + reserved
            );
        }

        TimeSlot slot =
                new TimeSlot();

        slot.setSite(site);
        slot.setSlotDate(
                request.slotDate()
        );
        slot.setStartTime(
                request.startTime()
        );
        slot.setEndTime(
                request.endTime()
        );
        slot.setCapacity(
                request.capacity()
        );
        slot.setActive(
                request.active() == null
                        || request.active()
        );

        return toResponse(
                timeSlotRepository.save(
                        slot
                )
        );
    }

    @Transactional
    public TimeSlotResponse updateTimeSlot(
            Long id,
            TimeSlotRequest request
    ) {
        validateRequest(request);

        TimeSlot slot =
                timeSlotRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Time slot not found"
                                )
                        );

        TouristSite site =
                requireSite(
                        request.siteId()
                );

        long reserved =
                reservedForRequest(
                        request
                );

        if (reserved > request.capacity()) {
            throw new IllegalArgumentException(
                    "Slot capacity cannot be lower than existing reserved visitors: "
                            + reserved
            );
        }

        slot.setSite(site);
        slot.setSlotDate(
                request.slotDate()
        );
        slot.setStartTime(
                request.startTime()
        );
        slot.setEndTime(
                request.endTime()
        );
        slot.setCapacity(
                request.capacity()
        );

        if (request.active() != null) {
            slot.setActive(
                    request.active()
            );
        }

        return toResponse(
                timeSlotRepository.save(
                        slot
                )
        );
    }

    @Transactional
    public void deleteTimeSlot(
            Long id
    ) {
        TimeSlot slot =
                timeSlotRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Time slot not found"
                                )
                        );

        long reserved =
                bookingRepository.reservedVisitorsForSlot(
                        slot.getSite().getId(),
                        slot.getSlotDate(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        BookingStatus.CANCELLED
                );

        if (reserved > 0) {
            throw new IllegalArgumentException(
                    "This slot has reserved visitors and cannot be deleted. Set it inactive instead."
            );
        }

        timeSlotRepository.delete(
                slot
        );
    }

    private TimeSlotResponse toResponse(
            TimeSlot slot
    ) {
        long reserved =
                bookingRepository.reservedVisitorsForSlot(
                        slot.getSite().getId(),
                        slot.getSlotDate(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        BookingStatus.CANCELLED
                );

        return TimeSlotResponse.from(
                slot,
                reserved
        );
    }

    private long reservedForRequest(
            TimeSlotRequest request
    ) {
        return bookingRepository.reservedVisitorsForSlot(
                request.siteId(),
                request.slotDate(),
                request.startTime(),
                request.endTime(),
                BookingStatus.CANCELLED
        );
    }

    private TouristSite requireSite(
            Long siteId
    ) {
        if (siteId == null) {
            throw new IllegalArgumentException(
                    "Site is required"
            );
        }

        return touristSiteRepository
                .findById(siteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tourist site not found"
                        )
                );
    }

    private void validateRequest(
            TimeSlotRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Time slot request is required"
            );
        }

        if (request.siteId() == null) {
            throw new IllegalArgumentException(
                    "Site is required"
            );
        }

        if (request.slotDate() == null) {
            throw new IllegalArgumentException(
                    "Slot date is required"
            );
        }

        if (
                request.startTime() == null
                        || request.endTime() == null
        ) {
            throw new IllegalArgumentException(
                    "Start time and end time are required"
            );
        }

        if (
                !request.endTime()
                        .isAfter(
                                request.startTime()
                        )
        ) {
            throw new IllegalArgumentException(
                    "End time must be after start time"
            );
        }

        if (
                request.capacity() == null
                        || request.capacity() <= 0
        ) {
            throw new IllegalArgumentException(
                    "Capacity must be greater than zero"
            );
        }
    }

    private String crowdLevel(
            int occupancyPercent
    ) {
        if (occupancyPercent < 40) {
            return "LOW";
        }

        if (occupancyPercent < 70) {
            return "MODERATE";
        }

        if (occupancyPercent < 90) {
            return "HIGH";
        }

        return "CRITICAL";
    }
}
