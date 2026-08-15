package com.tourflow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_alerts")
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    private TouristSite site;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(nullable = false, length = 140)
    private String location;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmergencySeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmergencyStatus status;

    @Column(name = "reported_at", nullable = false, updatable = false)
    private LocalDateTime reportedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public EmergencyAlert() {}

    @PrePersist
    protected void onCreate() {
        reportedAt = LocalDateTime.now();
        if (status == null) {
            status = EmergencyStatus.OPEN;
        }
        if (severity == null) {
            severity = EmergencySeverity.MEDIUM;
        }
    }

    public Long getId() {
        return id;
    }

    public TouristSite getSite() {
        return site;
    }

    public void setSite(TouristSite site) {
        this.site = site;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EmergencySeverity getSeverity() {
        return severity;
    }

    public void setSeverity(EmergencySeverity severity) {
        this.severity = severity;
    }

    public EmergencyStatus getStatus() {
        return status;
    }

    public void setStatus(EmergencyStatus status) {
        this.status = status;
    }

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
