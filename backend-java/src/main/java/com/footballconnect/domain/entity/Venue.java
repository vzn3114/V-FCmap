package com.footballconnect.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Venue Entity - Represents football venues/fields
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    private String description;

    @Embedded
    private Location location;

    @ElementCollection
    @CollectionTable(name = "venue_fields", joinColumns = @JoinColumn(name = "venue_id"))
    @Builder.Default
    private List<Field> fields = new ArrayList<>();

    @Embedded
    private Pricing pricing;

    @Embedded
    @Builder.Default
    private Amenities amenities = new Amenities();

    @ElementCollection
    @CollectionTable(name = "venue_images", joinColumns = @JoinColumn(name = "venue_id"))
    @Builder.Default
    private List<MediaItem> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "venue_videos", joinColumns = @JoinColumn(name = "venue_id"))
    @Builder.Default
    private List<MediaItem> videos = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "venue_operating_hours", joinColumns = @JoinColumn(name = "venue_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "hours")
    private Map<DayOfWeek, OperatingHours> operatingHours;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VenueStatus status = VenueStatus.ACTIVE;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private Double averageRating = 5.0;

    @Builder.Default
    private Integer totalBookings = 0;

    @ElementCollection
    @CollectionTable(name = "venue_popular_times", joinColumns = @JoinColumn(name = "venue_id"))
    @Column(name = "time")
    @Builder.Default
    private List<String> popularTimes = new ArrayList<>();

    private String qrCodeUrl;

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
    public static class Location {
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
    @Embeddable
    public static class Field {
        private String name;
        
        @Enumerated(EnumType.STRING)
        private FieldType type;
        
        @Enumerated(EnumType.STRING)
        @Builder.Default
        private SurfaceType surfaceType = SurfaceType.ARTIFICIAL_GRASS;
        
        @Enumerated(EnumType.STRING)
        @Builder.Default
        private FieldStatus status = FieldStatus.AVAILABLE;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class Pricing {
        private Double primeTime;    // 17h-20h
        private Double normalTime;
        private Double weekendRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class Amenities {
        @Builder.Default
        private Boolean parking = false;
        
        @Builder.Default
        private Boolean showers = false;
        
        @Builder.Default
        private Boolean changingRooms = false;
        
        @Builder.Default
        private Boolean wifi = false;
        
        @Builder.Default
        private Boolean drinks = false;
        
        @Builder.Default
        private Boolean equipmentRental = false;
        
        @Builder.Default
        private Boolean lighting = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class MediaItem {
        private String url;
        private String caption;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class OperatingHours {
        private LocalTime open;
        private LocalTime close;
    }

    // Enums
    public enum FieldType {
        FIVE_A_SIDE("5-a-side"),
        SEVEN_A_SIDE("7-a-side"),
        ELEVEN_A_SIDE("11-a-side");

        private final String displayName;

        FieldType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum SurfaceType {
        NATURAL_GRASS, ARTIFICIAL_GRASS, HARD_COURT
    }

    public enum FieldStatus {
        AVAILABLE, MAINTENANCE, CLOSED
    }

    public enum VenueStatus {
        ACTIVE, INACTIVE, PENDING_VERIFICATION
    }
}
