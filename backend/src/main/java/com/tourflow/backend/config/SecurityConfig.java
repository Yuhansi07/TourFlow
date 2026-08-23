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

        this.tokenFilter =
                tokenFilter;
    }


    /* =========================================================
       PASSWORD ENCODER
       ========================================================= */

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    /* =========================================================
       CORS
       ========================================================= */

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


        /*
         * Optional production frontend URL.
         */
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


    /* =========================================================
       SPRING SECURITY
       ========================================================= */

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
                        httpBasic ->
                                httpBasic.disable()
                )

                .formLogin(
                        formLogin ->
                                formLogin.disable()
                )

                .logout(
                        logout ->
                                logout.disable()
                )

                .cors(
                        Customizer.withDefaults()
                )


                /*
                 * Token authentication is stateless.
                 */
                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )


                .authorizeHttpRequests(
                        auth -> auth


                                /* =================================================
                                   CORS PREFLIGHT
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()


                                /* =================================================
                                   PUBLIC AUTHENTICATION
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/auth/login",
                                        "/api/auth/register"
                                )
                                .permitAll()


                                /* =================================================
                                   PUBLIC SITE INFORMATION
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/sites",
                                        "/api/sites/**"
                                )
                                .permitAll()


                                /* =================================================
                                   LOGGED-IN ACCOUNT ACTIONS
                                   ================================================= */

                                .requestMatchers(
                                        "/api/auth/me",
                                        "/api/auth/logout"
                                )
                                .authenticated()


                                /* =================================================
                                   SYSTEM ADMIN
                                   ================================================= */

                                .requestMatchers(
                                        "/api/admin/**"
                                )
                                .hasRole(
                                        "SYSTEM_ADMIN"
                                )


                                /* =================================================
                                   ENTRANCE OFFICER
                                   ================================================= */

                                .requestMatchers(
                                        "/api/entrance/**"
                                )
                                .hasAnyRole(
                                        "ENTRANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =================================================
                                   SITE MANAGER

                                   Tourist can read manager-created
                                   time slots.
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/manager/time-slots"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SITE_MANAGER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Other manager functions remain
                                 * restricted.
                                 */
                                .requestMatchers(
                                        "/api/manager/**"
                                )
                                .hasAnyRole(
                                        "SITE_MANAGER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =================================================
                                   SAFETY

                                   Tourist can view alerts for the
                                   selected site.

                                   Example:
                                   /api/safety/dashboard?siteId=2
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/safety/dashboard"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SAFETY_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Tourist can report a safety issue.
                                 */
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/safety/alerts"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SAFETY_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Status changes and all other
                                 * safety operations remain restricted
                                 * to Safety Officer/Admin.
                                 */
                                .requestMatchers(
                                        "/api/safety/**"
                                )
                                .hasAnyRole(
                                        "SAFETY_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =================================================
                                   MAINTENANCE

                                   IMPORTANT NEW RULE:

                                   Tourist can VIEW maintenance issues
                                   for the selected site.

                                   Example:
                                   /api/maintenance/dashboard?siteId=2
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/maintenance/dashboard"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "MAINTENANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Tourist can report a new site issue.
                                 */
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/maintenance/tasks"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "MAINTENANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Other maintenance operations,
                                 * including status updates,
                                 * remain restricted.
                                 */
                                .requestMatchers(
                                        "/api/maintenance/**"
                                )
                                .hasAnyRole(
                                        "MAINTENANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /* =================================================
                                   TOURIST OPERATIONS

                                   Includes Tour Guide selection/request.
                                   ================================================= */

                                .requestMatchers(
                                        "/api/tourist/**"
                                )
                                .hasAnyRole(
                                        "TOURIST",
                                        "SYSTEM_ADMIN"
                                )


                                /* =================================================
                                   TOUR GUIDE
                                   ================================================= */

                                .requestMatchers(
                                        "/api/guide/**"
                                )
                                .hasAnyRole(
                                        "TOUR_GUIDE",
                                        "SYSTEM_ADMIN"
                                )


                                /* =================================================
                                   BOOKINGS
                                   ================================================= */

                                .requestMatchers(
                                        "/api/bookings/**"
                                )
                                .authenticated()


                                /* =================================================
                                   SITE CREATION
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/sites",
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                /* =================================================
                                   SITE UPDATE
                                   ================================================= */

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


                                /* =================================================
                                   SITE DELETE
                                   ================================================= */

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                /* =================================================
                                   EVERYTHING ELSE
                                   ================================================= */

                                .anyRequest()
                                .authenticated()
                )


                /*
                 * Custom token authentication filter.
                 */
                .addFilterBefore(
                        tokenFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}