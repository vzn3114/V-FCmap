package com.footballconnect.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Match entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private TeamResponse.Summary homeTeam;
    private TeamResponse.Summary awayTeam;
    private VenueResponse.Summary venue;
    private String fieldName;
    private Long bookingId;
    private LocalDateTime scheduledTime;
    private String status;
    private MatchResultDto result;
    private Boolean isRanked;
    private String videoHighlightUrl;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchResultDto {
        private Integer homeScore;
        private Integer awayScore;
        private String resultStatus;
        private LocalDateTime completedAt;
        private Integer homePointsGained;
        private Integer awayPointsGained;
    }
}
