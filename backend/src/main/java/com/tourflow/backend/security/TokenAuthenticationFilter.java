package com.tourflow.backend.security;

import com.tourflow.backend.entity.AuthSession;
import com.tourflow.backend.entity.UserAccount;
import com.tourflow.backend.repository.AuthSessionRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;


@Component
public class TokenAuthenticationFilter
        extends OncePerRequestFilter {

    private final AuthSessionRepository sessionRepository;


    public TokenAuthenticationFilter(
            AuthSessionRepository sessionRepository
    ) {
        this.sessionRepository =
                sessionRepository;
    }


    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        String path =
                request.getRequestURI();


        if (
                path.equals("/api/auth/login")
                        ||
                        path.equals("/api/auth/register")
        ) {
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
                readBearerToken(
                        request
                );


        if (token != null) {

            Authentication currentAuthentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();


            boolean authenticationRequired =
                    currentAuthentication == null
                            ||
                            currentAuthentication
                                    instanceof AnonymousAuthenticationToken
                            ||
                            !currentAuthentication.isAuthenticated();


            if (authenticationRequired) {

                sessionRepository
                        .findValidSessionByToken(
                                token
                        )
                        .map(
                                AuthSession::getUser
                        )
                        .filter(
                                UserAccount::isActive
                        )
                        .ifPresent(
                                this::setAuthentication
                        );
            }
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
                        "ROLE_"
                                + user
                                .getRole()
                                .name()
                );


        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(
                                authority
                        )
                );


        SecurityContext securityContext =
                SecurityContextHolder
                        .createEmptyContext();


        securityContext.setAuthentication(
                authentication
        );


        SecurityContextHolder.setContext(
                securityContext
        );
    }


    private String readBearerToken(
            HttpServletRequest request
    ) {

        String authorization =
                request.getHeader(
                        "Authorization"
                );


        if (
                authorization == null
                        ||
                        !authorization.startsWith(
                                "Bearer "
                        )
        ) {
            return null;
        }


        String token =
                authorization
                        .substring(7)
                        .trim();


        if (token.isBlank()) {
            return null;
        }


        return token;
    }
}