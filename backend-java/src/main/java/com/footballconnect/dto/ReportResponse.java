package com.footballconnect.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Report entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private UserResponse.Summary reporter;
    private String reportType;
    private Long reportedUserId;
    private String reportedUserName;
    private Long reportedTeamId;
    private String reportedTeamName;
    private Long reportedVenueId;
    private String reportedVenueName;
    private String reason;
    private String description;
    private String evidence;
    private String status;
    private UserResponse.Summary reviewedBy;
    private String reviewNotes;
    private String action;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
