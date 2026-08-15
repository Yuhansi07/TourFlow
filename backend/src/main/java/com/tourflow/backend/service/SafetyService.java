package com.tourflow.backend.service;

import com.tourflow.backend.dto.EmergencyAlertRequest;
import com.tourflow.backend.dto.EmergencyAlertResponse;
import com.tourflow.backend.dto.SafetyDashboardResponse;
import com.tourflow.backend.entity.*;
import com.tourflow.backend.exception.ResourceNotFoundException;
import com.tourflow.backend.repository.EmergencyAlertRepository;
import com.tourflow.backend.repository.TouristSiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SafetyService {

    private final EmergencyAlertRepository alertRepository;
    private final TouristSiteRepository siteRepository;

    public SafetyService(
            EmergencyAlertRepository alertRepository,
            TouristSiteRepository siteRepository
    ) {
        this.alertRepository = alertRepository;
        this.siteRepository = siteRepository;
    }

    @Transactional(readOnly = true)
    public SafetyDashboardResponse dashboard(Long siteId) {
        TouristSite site = requireSite(siteId);

        List<EmergencyAlertResponse> alerts =
                alertRepository
                        .findBySiteIdOrderByReportedAtDesc(siteId)
                        .stream()
                        .map(EmergencyAlertResponse::from)
                        .toList();

        long active =
                alertRepository.countBySiteIdAndStatusNot(
                        siteId,
                        EmergencyStatus.RESOLVED
                );

        long critical =
                alertRepository.countBySiteIdAndSeverityAndStatusNot(
                        siteId,
                        EmergencySeverity.CRITICAL,
                        EmergencyStatus.RESOLVED
                );

        long resolvedToday =
                alertRepository.countBySiteIdAndStatusAndResolvedAtAfter(
                        siteId,
                        EmergencyStatus.RESOLVED,
                        LocalDate.now().atStartOfDay()
                );

        int visitors =
                site.getCurrentVisitors() == null
                        ? 0
                        : site.getCurrentVisitors();

        return new SafetyDashboardResponse(
                site.getId(),
                site.getName(),
                visitors,
                active,
                critical,
                resolvedToday,
                alerts
        );
    }

    @Transactional
    public EmergencyAlertResponse create(
            EmergencyAlertRequest request
    ) {
        if (request == null
                || request.siteId() == null
                || blank(request.title())
                || blank(request.location())
                || blank(request.description())) {
            throw new IllegalArgumentException(
                    "Site, title, location and description are required"
            );
        }

        TouristSite site =
                requireSite(request.siteId());

        EmergencyAlert alert =
                new EmergencyAlert();

        alert.setSite(site);
        alert.setTitle(request.title().trim());
        alert.setLocation(request.location().trim());
        alert.setDescription(request.description().trim());
        alert.setSeverity(
                request.severity() == null
                        ? EmergencySeverity.MEDIUM
                        : request.severity()
        );
        alert.setStatus(EmergencyStatus.OPEN);

        return EmergencyAlertResponse.from(
                alertRepository.save(alert)
        );
    }

    @Transactional
    public EmergencyAlertResponse updateStatus(
            Long id,
            EmergencyStatus status
    ) {
        EmergencyAlert alert =
                alertRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Emergency alert not found"
                                )
                        );

        alert.setStatus(status);

        if (status == EmergencyStatus.RESOLVED) {
            alert.setResolvedAt(
                    java.time.LocalDateTime.now()
            );
        } else {
            alert.setResolvedAt(null);
        }

        return EmergencyAlertResponse.from(
                alertRepository.save(alert)
        );
    }

    private TouristSite requireSite(Long siteId) {
        return siteRepository.findById(siteId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tourist site not found"
                        )
                );
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
