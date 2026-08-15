package com.tourflow.backend.config;

import com.tourflow.backend.entity.*;
import com.tourflow.backend.repository.EmergencyAlertRepository;
import com.tourflow.backend.repository.MaintenanceTaskRepository;
import com.tourflow.backend.repository.TouristSiteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OperationsDataInitializer {

    @Bean
    CommandLineRunner createSampleOperationsData(
            TouristSiteRepository siteRepository,
            EmergencyAlertRepository emergencyRepository,
            MaintenanceTaskRepository maintenanceRepository
    ) {
        return args -> {
            List<TouristSite> sites =
                    siteRepository.findAll();

            if (sites.isEmpty()) {
                return;
            }

            TouristSite site = sites.get(0);

            if (emergencyRepository.count() == 0) {
                createAlert(
                        emergencyRepository,
                        site,
                        "Slippery Path Warning",
                        "Main Staircase",
                        "Visitors reported a slippery section after rain.",
                        EmergencySeverity.HIGH
                );

                createAlert(
                        emergencyRepository,
                        site,
                        "First Aid Assistance",
                        "Visitor Centre",
                        "Minor medical assistance requested by a visitor.",
                        EmergencySeverity.MEDIUM
                );
            }

            if (maintenanceRepository.count() == 0) {
                createTask(
                        maintenanceRepository,
                        site,
                        "Broken Handrail",
                        "Main Staircase",
                        "Repair loose handrail before peak visitor hours.",
                        MaintenancePriority.HIGH
                );

                createTask(
                        maintenanceRepository,
                        site,
                        "Toilet Cleaning & Repair",
                        "Eastern Toilet Block",
                        "Clean facility and inspect damaged tap.",
                        MaintenancePriority.MEDIUM
                );

                createTask(
                        maintenanceRepository,
                        site,
                        "Lighting Inspection",
                        "Visitor Centre",
                        "Inspect entrance lighting and replace faulty bulb.",
                        MaintenancePriority.MEDIUM
                );
            }
        };
    }

    private void createAlert(
            EmergencyAlertRepository repository,
            TouristSite site,
            String title,
            String location,
            String description,
            EmergencySeverity severity
    ) {
        EmergencyAlert alert =
                new EmergencyAlert();

        alert.setSite(site);
        alert.setTitle(title);
        alert.setLocation(location);
        alert.setDescription(description);
        alert.setSeverity(severity);
        alert.setStatus(EmergencyStatus.OPEN);

        repository.save(alert);
    }

    private void createTask(
            MaintenanceTaskRepository repository,
            TouristSite site,
            String title,
            String location,
            String description,
            MaintenancePriority priority
    ) {
        MaintenanceTask task =
                new MaintenanceTask();

        task.setSite(site);
        task.setTitle(title);
        task.setLocation(location);
        task.setDescription(description);
        task.setPriority(priority);
        task.setStatus(MaintenanceStatus.PENDING);

        repository.save(task);
    }
}
