package com.tourflow.backend.service;

import com.tourflow.backend.dto.*;
import com.tourflow.backend.entity.AuthSession;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.entity.UserRole;
import com.tourflow.backend.repository.AuthSessionRepository;
import com.tourflow.backend.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserAccountRepository userRepository;
    private final AuthSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserAccountRepository userRepository,
            AuthSessionRepository sessionRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException(
                    "An account already exists with this email"
            );
        }

        UserAccount user = new UserAccount();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.TOURIST);
        user.setActive(true);

        return createSession(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        UserAccount user = userRepository
                .findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()
                || !passwordEncoder.matches(
                        request.password(),
                        user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return createSession(user);
    }

    @Transactional
    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            sessionRepository.deleteByToken(token);
        }
    }

    private AuthResponse createSession(UserAccount user) {
        AuthSession session = new AuthSession();
        session.setToken(UUID.randomUUID().toString().replace("-", ""));
        session.setUser(user);
        session.setExpiresAt(LocalDateTime.now().plusHours(24));

        AuthSession saved = sessionRepository.save(session);

        return new AuthResponse(
                saved.getToken(),
                saved.getExpiresAt(),
                UserResponse.from(user)
        );
    }
}
