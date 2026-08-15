package com.tourflow.backend.repository;

import com.tourflow.backend.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {
    Optional<AuthSession> findByTokenAndExpiresAtAfter(
            String token,
            LocalDateTime currentTime
    );

    void deleteByToken(String token);
}
