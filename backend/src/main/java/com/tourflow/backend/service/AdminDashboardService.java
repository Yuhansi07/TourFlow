package com.tourflow.backend.service;

import com.tourflow.backend.dto.AdminDashboardResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AdminDashboardService {

    private final JdbcTemplate jdbcTemplate;

    public AdminDashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public AdminDashboardResponse getDashboard() {
        long touristSites = count(
                "SELECT COUNT(*) FROM tourist_sites"
        );

        long totalUsers = count(
                "SELECT COUNT(*) FROM user_accounts"
        );

        long activeOfficers = count(
                """
                SELECT COUNT(*)
                FROM user_accounts
                WHERE active = 1
                  AND role IN (
                    'SITE_MANAGER',
                    'ENTRANCE_OFFICER',
                    'SAFETY_OFFICER',
                    'MAINTENANCE_OFFICER',
                    'TOUR_GUIDE'
                  )
                """
        );

        long systemAlerts = count(
                """
                SELECT COUNT(*)
                FROM emergency_alerts
                WHERE status <> 'RESOLVED'
                """
        );

        List<AdminDashboardResponse.RecentActivity> activity =
                new ArrayList<>();

        addBookingActivity(activity);
        addSafetyActivity(activity);
        addMaintenanceActivity(activity);

        activity.sort(
                Comparator.comparing(
                        AdminDashboardResponse.RecentActivity::occurredAt
                ).reversed()
        );

        if (activity.size() > 6) {
            activity = new ArrayList<>(
                    activity.subList(0, 6)
            );
        }

        AdminDashboardResponse.SystemHealth health =
                new AdminDashboardResponse.SystemHealth(
                        "OPERATIONAL",
                        "OPERATIONAL",
                        "OPERATIONAL",
                        "OPERATIONAL"
                );

        return new AdminDashboardResponse(
                touristSites,
                totalUsers,
                activeOfficers,
                systemAlerts,
                activity,
                health
        );
    }

    private long count(String sql) {
        Long value = jdbcTemplate.queryForObject(
                sql,
                Long.class
        );

        return value == null ? 0 : value;
    }

    private void addBookingActivity(
            List<AdminDashboardResponse.RecentActivity> activity
    ) {
        jdbcTemplate.query(
                """
                SELECT
                    b.booking_reference,
                    b.status,
                    b.updated_at,
                    s.name AS site_name
                FROM bookings b
                JOIN tourist_sites s
                  ON s.id = b.site_id
                ORDER BY b.updated_at DESC
                LIMIT 4
                """,
                rs -> {
                    activity.add(
                            new AdminDashboardResponse.RecentActivity(
                                    "BOOKING",
                                    "Booking " + rs.getString("status"),
                                    rs.getString("booking_reference")
                                            + " • "
                                            + rs.getString("site_name"),
                                    toLocalDateTime(
                                            rs.getTimestamp("updated_at")
                                    )
                            )
                    );
                }
        );
    }

    private void addSafetyActivity(
            List<AdminDashboardResponse.RecentActivity> activity
    ) {
        jdbcTemplate.query(
                """
                SELECT
                    title,
                    status,
                    severity,
                    reported_at
                FROM emergency_alerts
                ORDER BY reported_at DESC
                LIMIT 4
                """,
                rs -> {
                    activity.add(
                            new AdminDashboardResponse.RecentActivity(
                                    "SAFETY",
                                    rs.getString("title"),
                                    rs.getString("severity")
                                            + " • "
                                            + rs.getString("status"),
                                    toLocalDateTime(
                                            rs.getTimestamp("reported_at")
                                    )
                            )
                    );
                }
        );
    }

    private void addMaintenanceActivity(
            List<AdminDashboardResponse.RecentActivity> activity
    ) {
        jdbcTemplate.query(
                """
                SELECT
                    title,
                    status,
                    priority,
                    updated_at
                FROM maintenance_tasks
                ORDER BY updated_at DESC
                LIMIT 4
                """,
                rs -> {
                    activity.add(
                            new AdminDashboardResponse.RecentActivity(
                                    "MAINTENANCE",
                                    rs.getString("title"),
                                    rs.getString("priority")
                                            + " • "
                                            + rs.getString("status"),
                                    toLocalDateTime(
                                            rs.getTimestamp("updated_at")
                                    )
                            )
                    );
                }
        );
    }

    private LocalDateTime toLocalDateTime(
            Timestamp value
    ) {
        return value == null
                ? LocalDateTime.now()
                : value.toLocalDateTime();
    }
}
