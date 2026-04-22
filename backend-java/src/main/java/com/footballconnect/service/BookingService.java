package com.footballconnect.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.domain.entity.Team;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.BookingRepository;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;
import com.footballconnect.exception.UnauthorizedException;
import com.footballconnect.service.payment.PaymentProcessorFactory;

@Service
public class BookingService {

    private static final List<Booking.BookingStatus> ACTIVE_STATUSES = List.of(
            Booking.BookingStatus.PENDING,
            Booking.BookingStatus.CONFIRMED,
            Booking.BookingStatus.COMPLETED
    );

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final TeamRepository teamRepository;
    private final PaymentProcessorFactory paymentProcessorFactory;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          VenueRepository venueRepository,
                          TeamRepository teamRepository,
                          PaymentProcessorFactory paymentProcessorFactory) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.teamRepository = teamRepository;
        this.paymentProcessorFactory = paymentProcessorFactory;
    }

    public List<Booking> getMyBookings(String email) {
        User user = findUserByEmail(email);
        return bookingRepository.findByBookedById(user.getId());
    }

    public Booking getBookingForCurrentUser(Long bookingId, String email) {
        User user = findUserByEmail(email);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getBookedBy().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not allowed to access this booking");
        }
        return booking;
    }

    public Booking createBooking(String email,
                                 Long venueId,
                                 String fieldName,
                                 String fieldTypeText,
                                 Long teamId,
                                 String startTimeText,
                                 String endTimeText,
                                 String qrCode,
                                 String notes,
                                 List<Booking.BillSplit> billSplits) {
        LocalDateTime startTime = parseDateTime(startTimeText, "Invalid startTime format");
        LocalDateTime endTime = parseDateTime(endTimeText, "Invalid endTime format");
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("endTime must be after startTime");
        }

        User user = findUserByEmail(email);
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        Venue.FieldType fieldType = parseFieldType(fieldTypeText);

        boolean hasFieldType = venue.getFields() != null
            && venue.getFields().stream().anyMatch(field -> fieldType.equals(field.getType()));
        if (!hasFieldType) {
            throw new BadRequestException("Selected field type is not available for this venue");
        }

        Team team = null;
        if (teamId != null) {
            team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        }

        boolean overlapped = bookingRepository.existsOverlappingBooking(
                venue.getId(),
                fieldName,
                startTime,
                endTime,
                ACTIVE_STATUSES
        );
        if (overlapped) {
            throw new BadRequestException("Selected field is already booked for this time range");
        }

        Booking booking = Booking.builder()
                .venue(venue)
                .fieldName(fieldName)
                .fieldType(fieldType)
                .bookedBy(user)
                .team(team)
                .startTime(startTime)
                .endTime(endTime)
                .status(Booking.BookingStatus.PENDING)
                .paymentStatus(Booking.PaymentStatus.PENDING)
                .isCheckedIn(false)
                .qrCode(qrCode)
                .notes(notes)
                .billSplits(billSplits != null ? billSplits : List.of())
                .build();

        return bookingRepository.save(booking);
    }

    public Booking checkIn(Long bookingId, String email) {
        Booking booking = getBookingForCurrentUser(bookingId, email);
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setIsCheckedIn(true);
        booking.setCheckedInAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    /**
     * Process payment using appropriate payment processor based on payment method
     */
    public Booking processPayment(Long bookingId, String email, String paymentMethod, String paymentDetails) {
        Booking booking = getBookingForCurrentUser(bookingId, email);
        
        // Get appropriate payment processor using Factory
        var paymentProcessor = paymentProcessorFactory.getProcessor(paymentMethod);
        
        // Process payment
        String transactionId = paymentProcessor.processPayment(booking, paymentDetails);
        
        // Update booking with payment info
        booking.setPaymentIntentId(transactionId);
        booking.setPaymentStatus(Booking.PaymentStatus.PAID);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        
        return bookingRepository.save(booking);
    }

    /**
     * Cancel booking and refund if already paid
     */
    public Booking cancelBooking(Long bookingId, String email, String cancellationReason) {
        Booking booking = getBookingForCurrentUser(bookingId, email);
        
        if (booking.getStatus().equals(Booking.BookingStatus.CANCELLED)) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(cancellationReason);
        booking.setCancelledAt(LocalDateTime.now());

        // Refund if payment was made
        if (booking.getPaymentStatus().equals(Booking.PaymentStatus.PAID) && booking.getPaymentIntentId() != null) {
            var paymentProcessor = paymentProcessorFactory.getProcessor(
                    booking.getPaymentIntentId().split("-")[0].equals("COD") ? "COD" : "BANK_TRANSFER"
            );
            paymentProcessor.refundPayment(booking.getPaymentIntentId(), booking.getTotalPrice());
            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        }

        return bookingRepository.save(booking);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private LocalDateTime parseDateTime(String dateTime, String message) {
        try {
            return LocalDateTime.parse(dateTime);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException(message);
        }
    }

    private Venue.FieldType parseFieldType(String fieldTypeText) {
        try {
            return Venue.FieldType.valueOf(fieldTypeText);
        } catch (Exception ex) {
            throw new BadRequestException("Invalid fieldType. Use FIVE_A_SIDE, SEVEN_A_SIDE, or ELEVEN_A_SIDE");
        }
    }
}
