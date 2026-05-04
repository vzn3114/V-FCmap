package com.footballconnect.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for User entity.
 * Excludes sensitive fields: password, resetPasswordToken, resetPasswordExpire.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String avatar;
    private LocationDto location;
    private String preferredPosition;
    private String skillLevel;
    private Boolean isVerified;
    private Boolean isBanned;
    private String banReason;
    private Integer fairPlayScore;
    private Integer totalReviews;
    private Double averageRating;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationDto {
        private Double longitude;
        private Double latitude;
        private String address;
        private String district;
        private String city;
    }

    /**
     * Compact summary used when User is a nested reference (e.g. owner, bookedBy, captain).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String name;
        private String email;
        private String avatar;
        private String role;
    }
}
