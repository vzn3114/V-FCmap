package com.footballconnect.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Review entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private UserResponse.Summary reviewer;
    private String reviewType;
    private Long venueId;
    private String venueName;
    private Long teamId;
    private String teamName;
    private Long userId;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private ReviewCriteriaDto criteria;
    private Boolean isVerified;
    private String response;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewCriteriaDto {
        private Integer facilities;
        private Integer cleanliness;
        private Integer service;
        private Integer value;
    }
}
