package com.tourflow.backend.config;

import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;
import com.tourflow.backend.repository.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createDevelopmentUsers(
            UserAccountRepository repository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            createIfMissing(
                    repository,
                    passwordEncoder,
                    "TourFlow Administrator",
                    "admin@tourflow.local",
                    "Admin@123",
                    UserRole.SYSTEM_ADMIN
            );

            createIfMissing(
                    repository,
                    passwordEncoder,
                    "Development Tourist",
                    "tourist@tourflow.local",
                    "Tourist@123",
                    UserRole.TOURIST
            );

            createIfMissing(
                    repository,
                    passwordEncoder,
                    "Entrance Officer",
                    "entrance@tourflow.local",
                    "Entrance@123",
                    UserRole.ENTRANCE_OFFICER
            );

            createIfMissing(
                    repository,
                    passwordEncoder,
                    "Site Manager",
                    "manager@tourflow.local",
                    "Manager@123",
                    UserRole.SITE_MANAGER
            );

            createIfMissing(
                    repository,
                    passwordEncoder,
                    "Safety Officer",
                    "safety@tourflow.local",
                    "Safety@123",
                    UserRole.SAFETY_OFFICER
            );

            createIfMissing(
                    repository,
                    passwordEncoder,
                    "Maintenance Officer",
                    "maintenance@tourflow.local",
                    "Maintenance@123",
                    UserRole.MAINTENANCE_OFFICER
            );

            createIfMissing(
                    repository,
                    passwordEncoder,
                    "Tour Guide",
                    "guide@tourflow.local",
                    "Guide@123",
                    UserRole.TOUR_GUIDE
            );
        };
    }

    private void createIfMissing(
            UserAccountRepository repository,
            PasswordEncoder passwordEncoder,
            String fullName,
            String email,
            String password,
            UserRole role
    ) {
        if (repository.existsByEmailIgnoreCase(email)) {
            return;
        }

        UserAccount user = new UserAccount();

        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(password)
        );
        user.setRole(role);
        user.setActive(true);

        repository.save(user);

        System.out.println(
                "Development user created: "
                        + email
                        + " ["
                        + role
                        + "]"
        );
    }
}
