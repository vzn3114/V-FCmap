package com.footballconnect.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Team Entity - Represents football teams
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    @Builder.Default
    private String logo = "https://res.cloudinary.com/default-team-logo.png";

    @ManyToOne
    @JoinColumn(name = "captain_id")
    private User captain;

    @ElementCollection
    @CollectionTable(name = "team_members", joinColumns = @JoinColumn(name = "team_id"))
    @Builder.Default
    private List<TeamMember> members = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Tier tier = Tier.BRONZE;

    @Builder.Default
    private Integer rankingPoints = 0;

    @Builder.Default
    private Integer winningStreak = 0;

    @Embedded
    @Builder.Default
    private TeamStats stats = new TeamStats();

    @Builder.Default
    private Double winRate = 0.0;

    @Builder.Default
    private Integer fairPlayScore = 100;

    @Embedded
    private ActiveRegion activeRegion;

    @ElementCollection
    @CollectionTable(name = "team_preferred_play_times", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "play_time")
    @Builder.Default
    private List<String> preferredPlayTime = new ArrayList<>();

    @Builder.Default
    private Boolean lookingForMatch = false;

    private String teamDescription;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Boolean isBanned = false;

    private String banReason;

    @ElementCollection
    @CollectionTable(name = "team_achievements", joinColumns = @JoinColumn(name = "team_id"))
    private List<Achievement> achievements;

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
    public static class TeamMember {
        private Long userId;
        
        @Enumerated(EnumType.STRING)
        @Builder.Default
        private MemberRole role = MemberRole.MEMBER;
        
        @Builder.Default
        private LocalDateTime joinedAt = LocalDateTime.now();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class TeamStats {
        @Builder.Default
        private Integer totalMatches = 0;
        
        @Builder.Default
        private Integer wins = 0;
        
        @Builder.Default
        private Integer draws = 0;
        
        @Builder.Default
        private Integer losses = 0;
        
        @Builder.Default
        private Integer goalsScored = 0;
        
        @Builder.Default
        private Integer goalsConceded = 0;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class ActiveRegion {
        private String district;
        private String city;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class Achievement {
        private String title;
        private String description;
        private String iconUrl;
        private LocalDateTime earnedAt;
    }

    // Enums
    public enum Tier {
        BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
    }

    public enum MemberRole {
        CAPTAIN, MEMBER
    }
}
