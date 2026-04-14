package com.footballconnect.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Match Entity - Represents completed/scheduled matches
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "home_team_id")
    private Team homeTeam;

    @ManyToOne
    @JoinColumn(name = "away_team_id")
    private Team awayTeam;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    private String fieldName;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private LocalDateTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MatchStatus status = MatchStatus.SCHEDULED;

    @Embedded
    private MatchResult result;

    @Builder.Default
    private Boolean isRanked = true;

    private String videoHighlightUrl;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Nested Classes
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class MatchResult {
        private Integer homeScore;
        private Integer awayScore;
        
        @Enumerated(EnumType.STRING)
        @Builder.Default
        private ResultStatus resultStatus = ResultStatus.PENDING;
        
        private LocalDateTime completedAt;
        
        private Integer homePointsGained;
        private Integer awayPointsGained;
    }

    // Enums
    public enum MatchStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED
    }

    public enum ResultStatus {
        PENDING, CONFIRMED, DISPUTED, RESOLVED
    }
}
