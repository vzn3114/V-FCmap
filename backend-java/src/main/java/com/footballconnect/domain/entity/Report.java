package com.footballconnect.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Report Entity - Represents user reports for violations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReportType reportType = ReportType.USER;

    // Reported entity
    @ManyToOne
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    @ManyToOne
    @JoinColumn(name = "reported_team_id")
    private Team reportedTeam;

    @ManyToOne
    @JoinColumn(name = "reported_venue_id")
    private Venue reportedVenue;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReportReason reason = ReportReason.OTHER;

    private String description;

    private String evidence; // URL to evidence (screenshots, videos)

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    private String reviewNotes;

    private String action; // Action taken (warning, ban, etc.)

    private LocalDateTime reviewedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Enums
    public enum ReportType {
        USER, TEAM, VENUE
    }

    public enum ReportReason {
        FAKE_PROFILE,
        INAPPROPRIATE_BEHAVIOR,
        NO_SHOW,
        CHEATING,
        HARASSMENT,
        FALSE_INFORMATION,
        POOR_FACILITY,
        SCAM,
        OTHER
    }

    public enum ReportStatus {
        PENDING, UNDER_REVIEW, RESOLVED, DISMISSED
    }
}
