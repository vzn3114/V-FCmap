package com.footballconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.service.BookingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Booking Controller
 * Handles venue booking operations
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Get current user's bookings
     * GET /api/bookings/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Booking> bookings = bookingService.getMyBookings(email);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking by ID
     * GET /api/bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking booking = bookingService.getBookingForCurrentUser(id, email);
        return ResponseEntity.ok(booking);
    }

    /**
     * Create new booking
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking savedBooking = bookingService.createBooking(
                email,
                bookingRequest.getVenueId(),
                bookingRequest.getFieldName(),
                bookingRequest.getTeamId(),
                bookingRequest.getStartTime(),
                bookingRequest.getEndTime()
        );
        return ResponseEntity.ok(savedBooking);
    }

    /**
     * Check-in for booking
     * POST /api/bookings/{id}/checkin
     */
    @PostMapping("/{id}/checkin")
    public ResponseEntity<?> checkIn(@PathVariable Long id, @RequestBody CheckInRequest checkInRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking updated = bookingService.checkIn(id, email);
        return ResponseEntity.ok(updated);
    }

    /**
     * Process payment for booking
     * POST /api/bookings/{id}/payment
     */
    @PostMapping("/{id}/payment")
    public ResponseEntity<?> processPayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest paymentRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Booking booking = bookingService.processPayment(id, email, paymentRequest.getPaymentMethod(), paymentRequest.getTransactionId());
        return ResponseEntity.ok(new PaymentResponse("Payment processed successfully", booking.getId()));
    }

    /**
     * DTOs
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BookingRequest {
        @NotNull(message = "venueId is required")
        private Long venueId;

        @NotBlank(message = "fieldName is required")
        private String fieldName;

        private Long teamId;

        @NotBlank(message = "startTime is required")
        private String startTime;

        @NotBlank(message = "endTime is required")
        private String endTime;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CheckInRequest {
        private String qrCode;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PaymentRequest {
        @NotBlank(message = "paymentMethod is required")
        private String paymentMethod;

        private String transactionId;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class PaymentResponse {
        private String message;
        private Long bookingId;
    }
}
