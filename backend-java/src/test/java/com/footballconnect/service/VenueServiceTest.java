package com.footballconnect.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ForbiddenException;
import com.footballconnect.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VenueService venueService;

    private User ownerUser;
    private User otherUser;
    private Venue testVenue;

    @BeforeEach
    void setUp() {
        ownerUser = User.builder()
                .id(1L)
                .name("Owner")
                .email("owner@example.com")
                .role(User.Role.VENUE_OWNER)
                .build();

        otherUser = User.builder()
                .id(2L)
                .name("Other")
                .email("other@example.com")
                .role(User.Role.VENUE_OWNER)
                .build();

        testVenue = Venue.builder()
                .id(10L)
                .name("Test Venue")
                .owner(ownerUser)
                .location(Venue.Location.builder()
                        .latitude(10.78)
                        .longitude(106.66)
                        .district("District 1")
                        .city("Ho Chi Minh")
                        .build())
                .averageRating(4.5)
                .build();
    }

    @Test
    @DisplayName("getVenueById - found returns venue")
    void getVenueById_found_returnsVenue() {
        when(venueRepository.findById(10L)).thenReturn(Optional.of(testVenue));

        Venue result = venueService.getVenueById(10L);

        assertNotNull(result);
        assertEquals("Test Venue", result.getName());
    }

    @Test
    @DisplayName("getVenueById - not found throws ResourceNotFoundException")
    void getVenueById_notFound_throwsException() {
        when(venueRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                venueService.getVenueById(999L)
        );
    }

    @Test
    @DisplayName("createVenue - success with valid data")
    void createVenue_success() {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(ownerUser));
        when(venueRepository.save(any(Venue.class))).thenAnswer(inv -> {
            Venue v = inv.getArgument(0);
            v.setId(20L);
            return v;
        });

        Venue result = venueService.createVenue(
                "owner@example.com", "New Venue", "Description",
                Venue.Location.builder().latitude(10.0).longitude(106.0).build(),
                null, null, null, null, null, null, null, null, null, null
        );

        assertNotNull(result);
        assertEquals("New Venue", result.getName());
        assertEquals(ownerUser, result.getOwner());
        verify(venueRepository).save(any(Venue.class));
    }

    @Test
    @DisplayName("createVenue - blank name throws BadRequestException")
    void createVenue_blankName_throwsBadRequest() {
        assertThrows(BadRequestException.class, () ->
                venueService.createVenue(
                        "owner@example.com", "  ", "Description",
                        null, null, null, null, null, null, null, null, null, null, null
                )
        );
    }

    @Test
    @DisplayName("updateVenue - not owner throws ForbiddenException")
    void updateVenue_notOwner_throwsForbidden() {
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(otherUser));
        when(venueRepository.findById(10L)).thenReturn(Optional.of(testVenue));

        assertThrows(ForbiddenException.class, () ->
                venueService.updateVenue(
                        10L, "other@example.com", "Updated Name",
                        null, null, null, null, null, null, null, null, null, null, null, null, null
                )
        );
    }

    @Test
    @DisplayName("getNearbyVenues - delegates to repository native query")
    void getNearbyVenues_delegatesToRepository() {
        when(venueRepository.findNearby(10.78, 106.66, 5000)).thenReturn(List.of(testVenue));

        List<Venue> result = venueService.getNearbyVenues(10.78, 106.66, 5000);

        assertEquals(1, result.size());
        assertEquals("Test Venue", result.get(0).getName());
        verify(venueRepository).findNearby(10.78, 106.66, 5000);
    }

    @Test
    @DisplayName("getNearbyVenues - null coordinates throws BadRequestException")
    void getNearbyVenues_nullCoords_throwsBadRequest() {
        assertThrows(BadRequestException.class, () ->
                venueService.getNearbyVenues(null, 106.66, 5000)
        );
    }

    @Test
    @DisplayName("getVenueRating - returns average rating")
    void getVenueRating_returnsAverage() {
        when(venueRepository.findById(10L)).thenReturn(Optional.of(testVenue));

        Double rating = venueService.getVenueRating(10L);

        assertEquals(4.5, rating);
    }
}
