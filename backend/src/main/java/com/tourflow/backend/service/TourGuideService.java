package com.tourflow.backend.service;

import com.tourflow.backend.dto.GuideDashboardResponse;
import com.tourflow.backend.dto.GuideRequestResponse;
import com.tourflow.backend.entity.*;
import com.tourflow.backend.exception.ResourceNotFoundException;
import com.tourflow.backend.repository.BookingRepository;
import com.tourflow.backend.repository.GuideAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TourGuideService {

    private final BookingRepository bookingRepository;
    private final GuideAssignmentRepository assignmentRepository;

    public TourGuideService(
            BookingRepository bookingRepository,
            GuideAssignmentRepository assignmentRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public GuideDashboardResponse dashboard(
            UserAccount guide
    ) {
        List<Booking> bookings =
                bookingRepository
                        .findByStatusOrderByVisitDateAscVisitTimeAsc(
                                BookingStatus.CONFIRMED
                        );

        List<GuideRequestResponse> requests =
                bookings.stream()
                        .map(booking ->
                                toResponse(
                                        booking,
                                        guide
                                )
                        )
                        .toList();

        long pending =
                requests.stream()
                        .filter(request ->
                                request.requestStatus()
                                        == GuideRequestStatus.PENDING
                        )
                        .count();

        long accepted =
                assignmentRepository
                        .countByGuideIdAndStatus(
                                guide.getId(),
                                GuideRequestStatus.ACCEPTED
                        );

        long rejected =
                assignmentRepository
                        .countByGuideIdAndStatus(
                                guide.getId(),
                                GuideRequestStatus.REJECTED
                        );

        return new GuideDashboardResponse(
                pending,
                accepted,
                rejected,
                requests
        );
    }

    @Transactional
    public GuideRequestResponse respond(
            Long bookingId,
            GuideRequestStatus status,
            UserAccount guide
    ) {
        if (status == GuideRequestStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Use ACCEPTED or REJECTED"
            );
        }

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found"
                                )
                        );

        GuideAssignment assignment =
                assignmentRepository
                        .findByBookingIdAndGuideId(
                                bookingId,
                                guide.getId()
                        )
                        .orElseGet(
                                GuideAssignment::new
                        );

        assignment.setBooking(booking);
        assignment.setGuide(guide);
        assignment.setStatus(status);
        assignment.setLanguage("EN");

        assignmentRepository.save(assignment);

        return toResponse(
                booking,
                guide
        );
    }

    private GuideRequestResponse toResponse(
            Booking booking,
            UserAccount guide
    ) {
        GuideRequestStatus status =
                assignmentRepository
                        .findByBookingIdAndGuideId(
                                booking.getId(),
                                guide.getId()
                        )
                        .map(GuideAssignment::getStatus)
                        .orElse(
                                GuideRequestStatus.PENDING
                        );

        return new GuideRequestResponse(
                booking.getId(),
                booking.getBookingReference(),
                booking.getUser().getFullName(),
                booking.getSite().getName(),
                booking.getVisitDate(),
                booking.getVisitTime(),
                booking.getVisitorCount(),
                "EN",
                status
        );
    }
}
