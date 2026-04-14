package com.footballconnect.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Matchmaking Entity - Represents team search for opponents
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "matchmaking")
public class Matchmaking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    private String preferredDistrict;
    private String preferredCity;

    @ElementCollection
    @CollectionTable(name = "matchmaking_preferred_play_times", joinColumns = @JoinColumn(name = "matchmaking_id"))
    @Column(name = "play_time")
    private List<String> preferredPlayTimes;

    @Enumerated(EnumType.STRING)
    private Venue.FieldType preferredFieldType;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MatchmakingStatus status = MatchmakingStatus.ACTIVE;

    private Integer minRankingPoints;
    private Integer maxRankingPoints;

    private Double maxDistance; // kilometers

    private LocalDateTime preferredDate;

    @ManyToOne
    @JoinColumn(name = "matched_team_id")
    private Team matchedTeam;

    private LocalDateTime matchedAt;

    private LocalDateTime expiresAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Enums
    public enum MatchmakingStatus {
        ACTIVE, MATCHED, EXPIRED, CANCELLED
    }
}
