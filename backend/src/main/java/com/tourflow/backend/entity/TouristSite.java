package com.tourflow.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "tourist_sites")
public class TouristSite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Site name is required")
    @Size(max = 120, message = "Site name cannot exceed 120 characters")
    @Column(nullable = false, length = 120)
    private String name;

    @NotBlank(message = "District is required")
    @Size(max = 80, message = "District cannot exceed 80 characters")
    @Column(nullable = false, length = 80)
    private String district;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    @NotNull(message = "Daily capacity is required")
    @Min(value = 1, message = "Daily capacity must be at least 1")
    @Column(name = "daily_capacity", nullable = false)
    private Integer dailyCapacity;

    @NotNull(message = "Current visitor count is required")
    @Min(value = 0, message = "Current visitor count cannot be negative")
    @Column(name = "current_visitors", nullable = false)
    private Integer currentVisitors = 0;

    @NotNull(message = "Site status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SiteStatus status = SiteStatus.OPEN;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TouristSite() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.currentVisitors == null) {
            this.currentVisitors = 0;
        }

        if (this.status == null) {
            this.status = SiteStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDailyCapacity() {
        return dailyCapacity;
    }

    public void setDailyCapacity(Integer dailyCapacity) {
        this.dailyCapacity = dailyCapacity;
    }

    public Integer getCurrentVisitors() {
        return currentVisitors;
    }

    public void setCurrentVisitors(Integer currentVisitors) {
        this.currentVisitors = currentVisitors;
    }

    public SiteStatus getStatus() {
        return status;
    }

    public void setStatus(SiteStatus status) {
        this.status = status;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}