package com.tourflow.backend.repository;

import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository
        extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount>
    findByEmailIgnoreCase(
            String email
    );

    boolean
    existsByEmailIgnoreCase(
            String email
    );

    List<UserAccount>
    findByRoleAndActiveTrueOrderByFullNameAsc(
            UserRole role
    );
}