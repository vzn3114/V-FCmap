package com.footballconnect.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.BookingRepository;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ConflictException;
import com.footballconnect.service.payment.PaymentProcessorFactory;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VenueRepository venueRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private PaymentProcessorFactory paymentProcessorFactory;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Venue testVenue;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .role(User.Role.USER)
                .build();

        Venue.Field field = Venue.Field.builder()
                .name("Field A")
                .type(Venue.FieldType.FIVE_A_SIDE)
                .build();

        testVenue = Venue.builder()
                .id(10L)
                .name("Test Venue")
                .fields(List.of(field))
                .build();
    }

    @Test
    @DisplayName("createBooking - success with valid data")
    void createBooking_success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(venueRepository.findById(10L)).thenReturn(Optional.of(testVenue));
        when(bookingRepository.existsOverlappingBooking(anyLong(), anyString(), any(), any(), anyList()))
                .thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(100L);
            return b;
        });

        Booking result = bookingService.createBooking(
                "test@example.com", 10L, "Field A", "FIVE_A_SIDE", null,
                "2026-06-01T10:00:00", "2026-06-01T11:00:00", null, "Test notes", null
        );

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(Booking.BookingStatus.PENDING, result.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBooking - overlapping booking throws ConflictException")
    void createBooking_overlapping_throwsConflict() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(venueRepository.findById(10L)).thenReturn(Optional.of(testVenue));
        when(bookingRepository.existsOverlappingBooking(anyLong(), anyString(), any(), any(), anyList()))
                .thenReturn(true);

        assertThrows(ConflictException.class, () ->
                bookingService.createBooking(
                        "test@example.com", 10L, "Field A", "FIVE_A_SIDE", null,
                        "2026-06-01T10:00:00", "2026-06-01T11:00:00", null, null, null
                )
        );
    }

    @Test
    @DisplayName("createBooking - invalid field type throws BadRequestException")
    void createBooking_invalidFieldType_throwsBadRequest() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(venueRepository.findById(10L)).thenReturn(Optional.of(testVenue));

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(
                        "test@example.com", 10L, "Field A", "INVALID_TYPE", null,
                        "2026-06-01T10:00:00", "2026-06-01T11:00:00", null, null, null
                )
        );
    }

    @Test
    @DisplayName("getMyBookings - returns bookings for user")
    void getMyBookings_returnsUserBookings() {
        Booking booking = Booking.builder().id(1L).bookedBy(testUser).build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(bookingRepository.findByBookedById(1L)).thenReturn(List.of(booking));

        List<Booking> result = bookingService.getMyBookings("test@example.com");

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    @DisplayName("checkIn - successfully marks booking as checked in")
    void checkIn_success() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookedBy(testUser)
                .status(Booking.BookingStatus.CONFIRMED)
                .build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.checkIn(1L, "test@example.com");

        assertTrue(result.getIsCheckedIn());
        assertEquals(Booking.BookingStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getCheckedInAt());
    }

    @Test
    @DisplayName("cancelBooking - already cancelled throws BadRequestException")
    void cancelBooking_alreadyCancelled_throwsBadRequest() {
        Booking booking = Booking.builder()
                .id(1L)
                .bookedBy(testUser)
                .status(Booking.BookingStatus.CANCELLED)
                .build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class, () ->
                bookingService.cancelBooking(1L, "test@example.com", "Changed plans")
        );
    }
}
