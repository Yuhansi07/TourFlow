package com.tourflow.backend.service;

import com.tourflow.backend.dto.MaintenanceDashboardResponse;
import com.tourflow.backend.dto.MaintenanceTaskRequest;
import com.tourflow.backend.dto.MaintenanceTaskResponse;
import com.tourflow.backend.entity.*;
import com.tourflow.backend.exception.ResourceNotFoundException;
import com.tourflow.backend.repository.MaintenanceTaskRepository;
import com.tourflow.backend.repository.TouristSiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceTaskRepository taskRepository;
    private final TouristSiteRepository siteRepository;

    public MaintenanceService(
            MaintenanceTaskRepository taskRepository,
            TouristSiteRepository siteRepository
    ) {
        this.taskRepository = taskRepository;
        this.siteRepository = siteRepository;
    }

    @Transactional(readOnly = true)
    public MaintenanceDashboardResponse dashboard(
            Long siteId
    ) {
        TouristSite site = requireSite(siteId);

        List<MaintenanceTaskResponse> tasks =
                taskRepository
                        .findBySiteIdOrderByCreatedAtDesc(siteId)
                        .stream()
                        .map(MaintenanceTaskResponse::from)
                        .toList();

        return new MaintenanceDashboardResponse(
                site.getId(),
                site.getName(),
                tasks.size(),
                taskRepository.countBySiteIdAndStatus(
                        siteId,
                        MaintenanceStatus.PENDING
                ),
                taskRepository.countBySiteIdAndStatus(
                        siteId,
                        MaintenanceStatus.IN_PROGRESS
                ),
                taskRepository.countBySiteIdAndStatus(
                        siteId,
                        MaintenanceStatus.COMPLETED
                ),
                tasks
        );
    }

    @Transactional
    public MaintenanceTaskResponse create(
            MaintenanceTaskRequest request
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

        MaintenanceTask task =
                new MaintenanceTask();

        task.setSite(site);
        task.setTitle(request.title().trim());
        task.setLocation(request.location().trim());
        task.setDescription(request.description().trim());
        task.setPriority(
                request.priority() == null
                        ? MaintenancePriority.MEDIUM
                        : request.priority()
        );
        task.setStatus(MaintenanceStatus.PENDING);

        return MaintenanceTaskResponse.from(
                taskRepository.save(task)
        );
    }

    @Transactional
    public MaintenanceTaskResponse updateStatus(
            Long id,
            MaintenanceStatus status
    ) {
        MaintenanceTask task =
                taskRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Maintenance task not found"
                                )
                        );

        task.setStatus(status);

        return MaintenanceTaskResponse.from(
                taskRepository.save(task)
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
