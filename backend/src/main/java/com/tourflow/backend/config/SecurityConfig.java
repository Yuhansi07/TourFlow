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

    /*
     * Railway production:
     * FRONTEND_URL=https://your-tourflow.vercel.app
     *
     * Local fallback:
     * http://localhost:5173
     */
    @Value("${FRONTEND_URL:http://localhost:5173}")
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


        /*
         * Allowed frontend addresses.
         *
         * Local development still works.
         * Railway will also allow the
         * Vercel URL supplied through FRONTEND_URL.
         */
        List<String> allowedOrigins =
                new ArrayList<>();

        allowedOrigins.add(
                "http://localhost:5173"
        );

        allowedOrigins.add(
                "http://127.0.0.1:5173"
        );

        allowedOrigins.add(
                "http://localhost:5174"
        );

        allowedOrigins.add(
                "http://127.0.0.1:5174"
        );

        if (
                frontendUrl != null &&
                        !frontendUrl.isBlank() &&
                        !allowedOrigins.contains(frontendUrl)
        ) {
            allowedOrigins.add(
                    frontendUrl
            );
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


                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )


                .authorizeHttpRequests(
                        auth -> auth


                                /*
                                 * CORS preflight
                                 */
                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()


                                /*
                                 * Authentication
                                 */
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/auth/login",
                                        "/api/auth/register"
                                )
                                .permitAll()


                                /*
                                 * Public tourist-site viewing
                                 */
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/sites",
                                        "/api/sites/**"
                                )
                                .permitAll()


                                /*
                                 * Logged-in users
                                 */
                                .requestMatchers(
                                        "/api/auth/me",
                                        "/api/auth/logout"
                                )
                                .authenticated()


                                /*
                                 * Entrance Officer
                                 */
                                .requestMatchers(
                                        "/api/entrance/**"
                                )
                                .hasAnyRole(
                                        "ENTRANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Site Manager
                                 */
                                .requestMatchers(
                                        "/api/manager/**"
                                )
                                .hasAnyRole(
                                        "SITE_MANAGER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Safety Officer
                                 */
                                .requestMatchers(
                                        "/api/safety/**"
                                )
                                .hasAnyRole(
                                        "SAFETY_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Maintenance Officer
                                 */
                                .requestMatchers(
                                        "/api/maintenance/**"
                                )
                                .hasAnyRole(
                                        "MAINTENANCE_OFFICER",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Tour Guide
                                 */
                                .requestMatchers(
                                        "/api/guide/**"
                                )
                                .hasAnyRole(
                                        "TOUR_GUIDE",
                                        "SYSTEM_ADMIN"
                                )


                                /*
                                 * Tourist bookings
                                 */
                                .requestMatchers(
                                        "/api/bookings/**"
                                )
                                .authenticated()


                                /*
                                 * Add tourist sites
                                 */
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/sites",
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                /*
                                 * Update tourist sites
                                 */
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


                                /*
                                 * Delete tourist sites
                                 */
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/sites/**"
                                )
                                .hasAnyRole(
                                        "SYSTEM_ADMIN",
                                        "SITE_MANAGER"
                                )


                                /*
                                 * Everything else
                                 */
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