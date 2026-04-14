package com.footballconnect.domain.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Entity - Represents system users (players, venue owners, admins)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String phone;

    private String password;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;

    @Builder.Default
    private String avatar = "https://res.cloudinary.com/default-avatar.png";

    @Embedded
    private Location location;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Position preferredPosition = Position.ANY;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SkillLevel skillLevel = SkillLevel.INTERMEDIATE;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Boolean isBanned = false;

    private String banReason;

    @Builder.Default
    private Integer fairPlayScore = 100;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private Double averageRating = 5.0;

    private String resetPasswordToken;
    private LocalDateTime resetPasswordExpire;

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
        
        @Builder.Default
        private String address = "";
        private String district;
        private String city;
    }

    // Manual getters for Spring Security (Lombok not working with Java 25)
    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    // Enums
    public enum Role {
        USER, VENUE_OWNER, ADMIN
    }

    public enum Position {
        GK, DF, MF, FW, ANY
    }

    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, PRO
    }
}
