package com.tourflow.backend.service;

import com.tourflow.backend.dto.AdminCreateUserRequest;
import com.tourflow.backend.dto.AdminUserResponse;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;
import com.tourflow.backend.repository.UserAccountRepository;

import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserAccountRepository userRepository;

    private final PasswordEncoder passwordEncoder;


    public AdminUserService(
            UserAccountRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {

        return userRepository
                .findAll(
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                )
                .stream()
                .map(
                        AdminUserResponse::from
                )
                .toList();
    }


    @Transactional
    public AdminUserResponse createUser(
            AdminCreateUserRequest request
    ) {

        String email =
                request
                        .email()
                        .trim()
                        .toLowerCase();


        if (
                userRepository
                        .existsByEmailIgnoreCase(
                                email
                        )
        ) {

            throw new IllegalArgumentException(
                    "An account already exists with this email"
            );
        }


        /*
         * Tourists should use the public
         * Create Tourist Account page.
         *
         * This admin feature is only
         * for staff/admin accounts.
         */
        if (
                request.role() ==
                        UserRole.TOURIST
        ) {

            throw new IllegalArgumentException(
                    "Tourist accounts must be created using tourist registration"
            );
        }


        UserAccount user =
                new UserAccount();


        user.setFullName(
                request
                        .fullName()
                        .trim()
        );


        user.setEmail(
                email
        );


        user.setPasswordHash(
                passwordEncoder.encode(
                        request.password()
                )
        );


        user.setRole(
                request.role()
        );


        user.setActive(
                true
        );


        UserAccount saved =
                userRepository.save(
                        user
                );


        return AdminUserResponse.from(
                saved
        );
    }
}