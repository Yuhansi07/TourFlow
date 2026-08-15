package com.tourflow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "guide_assignments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_guide_booking_guide",
                columnNames = {
                        "booking_id",
                        "guide_id"
                }
        )
)
public class GuideAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "guide_id", nullable = false)
    private UserAccount guide;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GuideRequestStatus status;

    @Column(nullable = false, length = 10)
    private String language;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public GuideAssignment() {}

    @PrePersist
    @PreUpdate
    protected void touch() {
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = GuideRequestStatus.PENDING;
        }

        if (language == null || language.isBlank()) {
            language = "EN";
        }
    }

    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public UserAccount getGuide() {
        return guide;
    }

    public void setGuide(UserAccount guide) {
        this.guide = guide;
    }

    public GuideRequestStatus getStatus() {
        return status;
    }

    public void setStatus(GuideRequestStatus status) {
        this.status = status;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
