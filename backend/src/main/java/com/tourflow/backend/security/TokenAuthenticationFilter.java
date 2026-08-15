package com.tourflow.backend.security;

import com.tourflow.backend.entity.AuthSession;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.repository.AuthSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class TokenAuthenticationFilter
        extends OncePerRequestFilter {

    private final AuthSessionRepository sessionRepository;

    public TokenAuthenticationFilter(
            AuthSessionRepository sessionRepository
    ) {
        this.sessionRepository = sessionRepository;
    }

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        String path = request.getRequestURI();

        if (path.equals("/api/auth/login")
                || path.equals("/api/auth/register")) {
            return true;
        }

        return HttpMethod.OPTIONS.matches(
                request.getMethod()
        );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token =
                readBearerToken(request);

        if (token != null
                && SecurityContextHolder
                .getContext()
                .getAuthentication() == null) {

            sessionRepository
                    .findByTokenAndExpiresAtAfter(
                            token,
                            LocalDateTime.now()
                    )
                    .map(AuthSession::getUser)
                    .filter(UserAccount::isActive)
                    .ifPresent(this::setAuthentication);
        }

        filterChain.doFilter(
                request,
                response
        );
    }

    private void setAuthentication(
            UserAccount user
    ) {
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()
                );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(authority)
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);
    }

    private String readBearerToken(
            HttpServletRequest request
    ) {
        String authorization =
                request.getHeader("Authorization");

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {
            return null;
        }

        String token =
                authorization.substring(7).trim();

        return token.isBlank()
                ? null
                : token;
    }
}
