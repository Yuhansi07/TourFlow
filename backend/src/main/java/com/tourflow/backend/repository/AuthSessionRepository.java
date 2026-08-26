package com.tourflow.backend.repository;

import com.tourflow.backend.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AuthSessionRepository
        extends JpaRepository<AuthSession, Long> {

    @Query("""
            select session
            from AuthSession session
            join fetch session.user user
            where session.token = :token
              and session.expiresAt > CURRENT_TIMESTAMP
            """)
    Optional<AuthSession> findValidSessionByToken(
            @Param("token") String token
    );

    void deleteByToken(
            String token
    );
}