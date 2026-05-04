package com.footballconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Booking entity.
 * References are represented as summaries to avoid deep entity nesting.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private VenueResponse.Summary venue;
    private String fieldName;
    private String fieldType;
    private UserResponse.Summary bookedBy;
    private TeamResponse.Summary team;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Double totalPrice;
    private Double deposit;
    private Double remainingAmount;
    private String paymentStatus;
    private String qrCode;
    private Boolean isCheckedIn;
    private LocalDateTime checkedInAt;
    private List<BillSplitDto> billSplits;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillSplitDto {
        private Long userId;
        private Double amount;
        private String paymentStatus;
        private LocalDateTime paidAt;
    }
}
