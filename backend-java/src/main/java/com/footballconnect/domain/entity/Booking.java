package com.footballconnect.domain.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Booking Entity - Represents venue bookings
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    private String fieldName;

    @ManyToOne
    @JoinColumn(name = "booked_by_id")
    private User bookedBy;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private Double totalPrice;
    private Double deposit;
    private Double remainingAmount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String paymentIntentId; // Stripe Payment Intent ID

    private String qrCode;

    @Builder.Default
    private Boolean isCheckedIn = false;

    private LocalDateTime checkedInAt;

    @ElementCollection
    @CollectionTable(name = "booking_bill_splits", joinColumns = @JoinColumn(name = "booking_id"))
    @Builder.Default
    private List<BillSplit> billSplits = new ArrayList<>();

    private String cancellationReason;
    private LocalDateTime cancelledAt;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Nested Classes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class BillSplit {
        private Long userId;
        
        private Double amount;
        
        @Enumerated(EnumType.STRING)
        private PaymentStatus paymentStatus = PaymentStatus.PENDING;
        
        private LocalDateTime paidAt;
    }

    // Enums
    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
    }

    public enum PaymentStatus {
        PENDING, PARTIAL, PAID, REFUNDED
    }
}
