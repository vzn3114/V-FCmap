package com.footballconnect.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Review Entity - Represents reviews for venues, teams, or users
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReviewType reviewType = ReviewType.VENUE;

    // References based on type
    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private Integer rating; // 1-5

    private String comment;

    @Embedded
    private ReviewCriteria criteria;

    @Builder.Default
    private Boolean isVerified = false;

    private String response; // Owner/Admin response

    private LocalDateTime respondedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Nested Classes
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class ReviewCriteria {
        private Integer facilities;
        private Integer cleanliness;
        private Integer service;
        private Integer value;
    }

    // Enums
    public enum ReviewType {
        VENUE, TEAM, USER
    }
}
