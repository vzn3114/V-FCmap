package com.footballconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Matchmaking entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchmakingResponse {
    private Long id;
    private TeamResponse.Summary team;
    private String preferredDistrict;
    private String preferredCity;
    private List<String> preferredPlayTimes;
    private String preferredFieldType;
    private String status;
    private Integer minRankingPoints;
    private Integer maxRankingPoints;
    private Double maxDistance;
    private LocalDateTime preferredDate;
    private TeamResponse.Summary matchedTeam;
    private LocalDateTime matchedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
