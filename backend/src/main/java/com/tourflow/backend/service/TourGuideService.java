package com.tourflow.backend.service;

import com.tourflow.backend.dto.GuideDashboardResponse;
import com.tourflow.backend.dto.GuideRequestResponse;

import com.tourflow.backend.entity.Booking;
import com.tourflow.backend.entity.GuideAssignment;
import com.tourflow.backend.entity.GuideRequestStatus;
import com.tourflow.backend.entity.UserAccount;

import com.tourflow.backend.exception.ResourceNotFoundException;

import com.tourflow.backend.repository.GuideAssignmentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class TourGuideService {

    private final GuideAssignmentRepository
            assignmentRepository;


    public TourGuideService(
            GuideAssignmentRepository assignmentRepository
    ) {

        this.assignmentRepository =
                assignmentRepository;
    }


    @Transactional(readOnly = true)
    public GuideDashboardResponse dashboard(
            UserAccount guide
    ) {

        List<GuideAssignment> assignments =
                assignmentRepository
                        .findForGuide(
                                guide.getId()
                        );


        List<GuideRequestResponse> requests =
                assignments
                        .stream()
                        .map(
                                this::toResponse
                        )
                        .toList();


        long pending =
                assignments
                        .stream()
                        .filter(
                                assignment ->
                                        assignment.getStatus()
                                                ==
                                                GuideRequestStatus.PENDING
                        )
                        .count();


        long accepted =
                assignments
                        .stream()
                        .filter(
                                assignment ->
                                        assignment.getStatus()
                                                ==
                                                GuideRequestStatus.ACCEPTED
                        )
                        .count();


        long rejected =
                assignments
                        .stream()
                        .filter(
                                assignment ->
                                        assignment.getStatus()
                                                ==
                                                GuideRequestStatus.REJECTED
                        )
                        .count();


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

        if (
                status ==
                        GuideRequestStatus.PENDING
        ) {

            throw new IllegalArgumentException(
                    "Use ACCEPTED or REJECTED"
            );
        }


        /*
         * The guide can respond only
         * to a request specifically
         * assigned to that guide.
         */
        GuideAssignment assignment =
                assignmentRepository
                        .findByBookingIdAndGuideId(
                                bookingId,
                                guide.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Guide request not found"
                                        )
                        );


        assignment.setStatus(
                status
        );


        GuideAssignment saved =
                assignmentRepository
                        .save(
                                assignment
                        );


        return toResponse(
                saved
        );
    }


    private GuideRequestResponse toResponse(
            GuideAssignment assignment
    ) {

        Booking booking =
                assignment.getBooking();


        return new GuideRequestResponse(

                booking.getId(),

                booking.getBookingReference(),

                booking
                        .getUser()
                        .getFullName(),

                booking
                        .getSite()
                        .getName(),

                booking.getVisitDate(),

                booking.getVisitTime(),

                booking.getVisitorCount(),

                assignment.getLanguage(),

                assignment.getStatus()
        );
    }
}