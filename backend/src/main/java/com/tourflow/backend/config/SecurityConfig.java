package com.tourflow.backend.config;

import com.tourflow.backend.security.TokenAuthenticationFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;


@Configuration
public class SecurityConfig {

    private final TokenAuthenticationFilter tokenFilter;

    @Value("${FRONTEND_URL:}")
    private String frontendUrl;


    public SecurityConfig(
            TokenAuthenticationFilter tokenFilter
    ) {
        this.tokenFilter = tokenFilter;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        List<String> allowedOrigins =
                new ArrayList<>(
                        List.of(
                                "http://localhost:5173",
                                "http://127.0.0.1:5173",
                                "http://localhost:5174",
                                "http://127.0.0.1:5174",
                                "https://tour-flow-two.vercel.app"
                        )
                );


        if (
                frontendUrl != null &&
                        !frontendUrl.isBlank()
        ) {

            String normalizedFrontendUrl =
                    frontendUrl.trim();

            while (
                    normalizedFrontendUrl.endsWith("/")
            ) {
                normalizedFrontendUrl =
                        normalizedFrontendUrl.substring(
                                0,
                                normalizedFrontendUrl.length() - 1
                        );
            }

            if (
                    !normalizedFrontendUrl.isBlank() &&
                            !allowedOrigins.contains(
                                    normalizedFrontendUrl
                            )
            ) {
                allowedOrigins.add(
                        normalizedFrontendUrl
                );
            }
        }


        configuration.setAllowedOrigins(
                allowedOrigins
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        configuration.setAllowCredentials(
                false
        );

        configuration.setMaxAge(
                3600L
        );


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                .csrf(
                        csrf ->
                                csrf.disable()
                )

                .httpBasic(
                        basic ->
                                basic.disable()
                )

                .formLogin(
                        form ->
                                form.disable()
                )

                .logout(
                        logout ->
                                logout.disable()
                )

                .cors(
                        Customizer.withDefaults()
                )

                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )

                .authorizeHttpRequests(
                        auth -> auth


                                /* =========================
                                   OPTIONS
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()


                                /* =========================
                                   AUTH
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/auth/login",
                                        "/api/auth/register"
                                )
                                .permitAll()


                                .requestMatchers(
                                        "/api/auth/me",
                                        "/api/auth/logout"
                                )
                                .authenticated()


                                /* =========================
                                   PUBLIC SITES
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/sites",
                                        "/api/sites/**"
                                )
                                .permitAll()


                                /* =========================
                                   TOUR GUIDE
                                   IMPORTANT:
                                   Explicit authority matching
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/guide/dashboard"
                                )
                                .hasAnyAuthority(
                                        "ROLE_TOUR_GUIDE",
                                        "ROLE_SYSTEM_ADMIN"
                                )


                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/guide/requests/**"
                                )
                                .hasAnyAuthority(
                                        "ROLE_TOUR_GUIDE",
                                        "ROLE_SYSTEM_ADMIN"
                                )


                                .requestMatchers(
                                        "/api/guide/**"
                                )
                                .hasAnyAuthority(
                                        "ROLE_TOUR_GUIDE",
                                        "ROLE_SYSTEM_ADMIN"
                                )


                                /* =========================
                                   ADMIN
                                   ========================= */

                                .requestMatchers(
                                        "/api/admin/**"
                                )
                                .hasRole(
                                        "SYSTEM_ADMIN"
                                )


                                /* =========================
                                   ENTRANCE
                                   ========================= */

                                .requestMatchers(
                                        "/api/entrance/**"
                                )
                                .hasAnyRole(
                                        "ENTRANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =========================
                                   MANAGER TIME SLOTS
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/manager/time-slots"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SITE_MANAGER",
                                        "SYSTEM_ADMIN"
                                )


                                .requestMatchers(
                                        "/api/manager/**"
                                )
                                .hasAnyRole(
                                        "SITE_MANAGER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =========================
                                   SAFETY
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/safety/dashboard"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SAFETY_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/safety/alerts"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SAFETY_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                .requestMatchers(
                                        "/api/safety/**"
                                )
                                .hasAnyRole(
                                        "SAFETY_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =========================
                                   MAINTENANCE
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/maintenance/dashboard"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "MAINTENANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/maintenance/tasks"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "MAINTENANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                .requestMatchers(
                                        "/api/maintenance/**"
                                )
                                .hasAnyRole(
                                        "MAINTENANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =========================
                                   TOURIST
                                   ========================= */

                                .requestMatchers(
                                        "/api/tourist/**"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SYSTEM_ADMIN"
                                )


                                /* =========================
                                   BOOKINGS
                                   ========================= */

                                .requestMatchers(
                                        "/api/bookings/**"
                                )
                                .authenticated()


                                /* =========================
                                   SITE CREATE
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/sites",
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                /* =========================
                                   SITE UPDATE
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                /* =========================
                                   SITE DELETE
                                   ========================= */

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                /* =========================
                                   EVERYTHING ELSE
                                   ========================= */

                                .anyRequest()
                                .authenticated()
                )


                .addFilterBefore(
                        tokenFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}