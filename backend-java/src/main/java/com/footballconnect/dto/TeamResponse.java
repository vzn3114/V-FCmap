package com.footballconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Team entity.
 * Captain is represented as UserResponse.Summary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {
    private Long id;
    private String name;
    private String logo;
    private UserResponse.Summary captain;
    private List<TeamMemberDto> members;
    private String tier;
    private Integer rankingPoints;
    private Integer winningStreak;
    private TeamStatsDto stats;
    private Double winRate;
    private Integer fairPlayScore;
    private ActiveRegionDto activeRegion;
    private List<String> preferredPlayTime;
    private Boolean lookingForMatch;
    private String teamDescription;
    private Boolean isVerified;
    private Boolean isBanned;
    private String banReason;
    private List<AchievementDto> achievements;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberDto {
        private Long userId;
        private String role;
        private LocalDateTime joinedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamStatsDto {
        private Integer totalMatches;
        private Integer wins;
        private Integer draws;
        private Integer losses;
        private Integer goalsScored;
        private Integer goalsConceded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveRegionDto {
        private String district;
        private String city;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementDto {
        private String title;
        private String description;
        private String iconUrl;
        private LocalDateTime earnedAt;
    }

    /**
     * Compact summary used when Team is a nested reference (e.g. in Booking, Match).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String name;
        private String logo;
        private String tier;
    }
}
