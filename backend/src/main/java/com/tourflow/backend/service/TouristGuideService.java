package com.tourflow.backend.service;

import com.tourflow.backend.dto.GuideOptionResponse;
import com.tourflow.backend.dto.GuideRequestCreateRequest;
import com.tourflow.backend.dto.TouristGuideRequestResponse;

import com.tourflow.backend.entity.Booking;
import com.tourflow.backend.entity.BookingStatus;
import com.tourflow.backend.entity.GuideAssignment;
import com.tourflow.backend.entity.GuideRequestStatus;
import com.tourflow.backend.entity.TouristSite;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;

import com.tourflow.backend.exception.ResourceNotFoundException;

import com.tourflow.backend.repository.BookingRepository;
import com.tourflow.backend.repository.GuideAssignmentRepository;
import com.tourflow.backend.repository.TouristSiteRepository;
import com.tourflow.backend.repository.UserAccountRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class TouristGuideService {

    private final UserAccountRepository userRepository;
    private final BookingRepository bookingRepository;
    private final GuideAssignmentRepository assignmentRepository;
    private final TouristSiteRepository siteRepository;


    public TouristGuideService(
            UserAccountRepository userRepository,
            BookingRepository bookingRepository,
            GuideAssignmentRepository assignmentRepository,
            TouristSiteRepository siteRepository
    ) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.assignmentRepository = assignmentRepository;
        this.siteRepository = siteRepository;
    }


    /* =========================================================
       AVAILABLE TOUR GUIDE SERVICES FOR ONE SITE
       ========================================================= */

    @Transactional(readOnly = true)
    public List<GuideOptionResponse> getAvailableGuides(
            Long siteId
    ) {

        if (siteId == null) {
            throw new IllegalArgumentException(
                    "Tourist site is required"
            );
        }

        TouristSite site =
                siteRepository
                        .findById(siteId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Tourist site not found"
                                        )
                        );

        return userRepository
                .findByRoleAndActiveTrueOrderByFullNameAsc(
                        UserRole.TOUR_GUIDE
                )
                .stream()
                .map(
                        guide ->
                                new GuideOptionResponse(
                                        guide.getId(),
                                        businessName(
                                                site.getName(),
                                                guide
                                        ),
                                        guide.getEmail(),
                                        "EN",
                                        guideRating(guide)
                                )
                )
                .toList();
    }


    /* =========================================================
       TOURIST'S GUIDE REQUESTS
       ========================================================= */

    @Transactional(readOnly = true)
    public List<TouristGuideRequestResponse> getMyRequests(
            UserAccount tourist
    ) {

        requireTourist(tourist);

        return assignmentRepository
                .findForTourist(
                        tourist.getId()
                )
                .stream()
                .map(this::toTouristResponse)
                .toList();
    }


    /* =========================================================
       REQUEST GUIDE
       ========================================================= */

    @Transactional
    public TouristGuideRequestResponse requestGuide(
            UserAccount tourist,
            GuideRequestCreateRequest request
    ) {

        requireTourist(tourist);

        if (
                request == null ||
                        request.bookingId() == null ||
                        request.guideId() == null
        ) {
            throw new IllegalArgumentException(
                    "Booking and tour guide are required"
            );
        }

        Booking booking =
                bookingRepository
                        .findById(
                                request.bookingId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Booking not found"
                                        )
                        );

        if (
                booking.getUser() == null ||
                        !booking
                                .getUser()
                                .getId()
                                .equals(
                                        tourist.getId()
                                )
        ) {
            throw new IllegalArgumentException(
                    "You can request a guide only for your own booking"
            );
        }

        if (
                booking.getStatus() !=
                        BookingStatus.CONFIRMED
        ) {
            throw new IllegalArgumentException(
                    "A guide can be requested only for a confirmed booking"
            );
        }

        UserAccount guide =
                userRepository
                        .findById(
                                request.guideId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Tour guide not found"
                                        )
                        );

        if (
                guide.getRole() !=
                        UserRole.TOUR_GUIDE ||
                        !guide.isActive()
        ) {
            throw new IllegalArgumentException(
                    "Selected account is not an active tour guide"
            );
        }

        List<GuideAssignment> existingAssignments =
                assignmentRepository
                        .findByBookingId(
                                booking.getId()
                        );

        GuideAssignment accepted =
                existingAssignments
                        .stream()
                        .filter(
                                assignment ->
                                        assignment.getStatus() ==
                                                GuideRequestStatus.ACCEPTED
                        )
                        .findFirst()
                        .orElse(null);

        if (accepted != null) {

            if (
                    accepted
                            .getGuide()
                            .getId()
                            .equals(
                                    guide.getId()
                            )
            ) {
                return toTouristResponse(
                        accepted
                );
            }

            throw new IllegalArgumentException(
                    "A tour guide has already accepted this booking"
            );
        }

        if (!existingAssignments.isEmpty()) {

            assignmentRepository
                    .deleteByBookingId(
                            booking.getId()
                    );

            assignmentRepository.flush();
        }

        GuideAssignment assignment =
                new GuideAssignment();

        assignment.setBooking(booking);
        assignment.setGuide(guide);
        assignment.setStatus(
                GuideRequestStatus.PENDING
        );
        assignment.setLanguage("EN");

        GuideAssignment saved =
                assignmentRepository
                        .save(assignment);

        return toTouristResponse(saved);
    }


    /* =========================================================
       TOURIST RESPONSE
       ========================================================= */

    private TouristGuideRequestResponse toTouristResponse(
            GuideAssignment assignment
    ) {

        Booking booking =
                assignment.getBooking();

        UserAccount guide =
                assignment.getGuide();

        return new TouristGuideRequestResponse(
                assignment.getId(),
                booking.getId(),
                booking.getBookingReference(),
                guide.getId(),
                businessName(
                        booking
                                .getSite()
                                .getName(),
                        guide
                ),
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


    /* =========================================================
       SITE-SPECIFIC GUIDE BUSINESS NAMES
       ========================================================= */

    private String businessName(
            String siteName,
            UserAccount guide
    ) {

        String email =
                normalizedEmail(guide);

        return switch (siteName) {

            case "Ella Rock and Nine Arch Bridge" ->
                    switch (email) {
                        case "guidetest@gmail.com" ->
                                "Ella Adventure Tours";
                        case "testguide2@gmail.com" ->
                                "Nine Arch Trail Guides";
                        case "guide@tourflow.local" ->
                                "Uva Scenic Tours";
                        default ->
                                "Ella Local Guide Service";
                    };

            case "Galle Fort" ->
                    switch (email) {
                        case "guidetest@gmail.com" ->
                                "Ceylon Heritage Guides";
                        case "testguide2@gmail.com" ->
                                "Serendib Travel Guides";
                        case "guide@tourflow.local" ->
                                "Galle Fort Walks";
                        default ->
                                "Galle Heritage Guide Service";
                    };

            case "Horton Plains" ->
                    switch (email) {
                        case "guidetest@gmail.com" ->
                                "Horton Plains Nature Guides";
                        case "testguide2@gmail.com" ->
                                "World's End Eco Tours";
                        case "guide@tourflow.local" ->
                                "Highland Trek Guides";
                        default ->
                                "Horton Plains Guide Service";
                    };

            case "Sigiriya Rock Fortress" ->
                    switch (email) {
                        case "guidetest@gmail.com" ->
                                "Sigiriya Heritage Tours";
                        case "testguide2@gmail.com" ->
                                "Lion Rock Guides";
                        case "guide@tourflow.local" ->
                                "Cultural Triangle Tours";
                        default ->
                                "Sigiriya Guide Service";
                    };

            case "Temple of the Tooth Relic" ->
                    switch (email) {
                        case "guidetest@gmail.com" ->
                                "Kandy Heritage Guides";
                        case "testguide2@gmail.com" ->
                                "Sacred City Tours";
                        case "guide@tourflow.local" ->
                                "Ceylon Cultural Guides";
                        default ->
                                "Kandy Guide Service";
                    };

            default ->
                    "TourFlow Guide Service";
        };
    }


    /* =========================================================
       GUIDE RATING
       ========================================================= */

    private double guideRating(
            UserAccount guide
    ) {

        return switch (
                normalizedEmail(guide)
                ) {
            case "guidetest@gmail.com" ->
                    4.8;

            case "testguide2@gmail.com" ->
                    4.6;

            case "guide@tourflow.local" ->
                    4.9;

            default ->
                    4.5;
        };
    }


    private String normalizedEmail(
            UserAccount guide
    ) {

        if (
                guide == null ||
                        guide.getEmail() == null
        ) {
            return "";
        }

        return guide
                .getEmail()
                .trim()
                .toLowerCase();
    }


    private void requireTourist(
            UserAccount tourist
    ) {

        if (
                tourist == null ||
                        tourist.getRole() !=
                                UserRole.TOURIST
        ) {
            throw new IllegalArgumentException(
                    "Tourist account is required"
            );
        }
    }
}