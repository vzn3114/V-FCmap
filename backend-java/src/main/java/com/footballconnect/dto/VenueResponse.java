package com.footballconnect.dto;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Venue entity.
 * Owner is represented as UserResponse.Summary to avoid deep nesting.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueResponse {
    private Long id;
    private String name;
    private UserResponse.Summary owner;
    private String description;
    private LocationDto location;
    private List<FieldDto> fields;
    private PricingDto pricing;
    private AmenitiesDto amenities;
    private List<MediaItemDto> images;
    private List<MediaItemDto> videos;
    private Map<DayOfWeek, OperatingHoursDto> operatingHours;
    private String status;
    private Boolean isVerified;
    private Integer totalReviews;
    private Double averageRating;
    private Integer totalBookings;
    private List<String> popularTimes;
    private String qrCodeUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldDto {
        private String name;
        private String type;
        private String surfaceType;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingDto {
        private Double primeTime;
        private Double normalTime;
        private Double weekendRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmenitiesDto {
        private Boolean parking;
        private Boolean showers;
        private Boolean changingRooms;
        private Boolean wifi;
        private Boolean drinks;
        private Boolean equipmentRental;
        private Boolean lighting;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaItemDto {
        private String url;
        private String caption;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OperatingHoursDto {
        private LocalTime open;
        private LocalTime close;
    }

    /**
     * Compact summary used when Venue is a nested reference.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String name;
        private String district;
        private String city;
    }
}
