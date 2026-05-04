package com.footballconnect.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.Venue;
import com.footballconnect.dto.DtoMapper;
import com.footballconnect.dto.VenueResponse;
import com.footballconnect.service.VenueService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Venue Controller
 * Handles venue management and search operations
 */
@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "*", maxAge = 3600)
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    /**
     * Search venues with filters
     * GET /api/venues
     */
    @GetMapping
    public ResponseEntity<List<VenueResponse>> searchVenues(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean hasParking,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String fieldType) {
        List<Venue> venues = venueService.searchVenues(name, minPrice, maxPrice, district, city, hasParking, verified, minRating, fieldType);
        return ResponseEntity.ok(DtoMapper.toVenueResponseList(venues));
    }

    /**
     * Get nearby venues
     * GET /api/venues/nearby
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<VenueResponse>> getNearbyVenues(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5000") Integer maxDistance) {
        List<Venue> venues = venueService.getNearbyVenues(latitude, longitude, maxDistance);
        return ResponseEntity.ok(DtoMapper.toVenueResponseList(venues));
    }

    /**
     * Get venue by ID
     * GET /api/venues/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> getVenueById(@PathVariable Long id) {
        Venue venue = venueService.getVenueById(id);
        return ResponseEntity.ok(DtoMapper.toVenueResponse(venue));
    }

    /**
     * Create new venue (owner only)
     * POST /api/venues/owner
     */
    @PostMapping("/owner")
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody VenueRequest venueRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Venue venue = venueService.createVenue(
            email,
                venueRequest.getName(),
                venueRequest.getDescription(),
                venueRequest.getLocation(),
                venueRequest.getPricing(),
                venueRequest.getAmenities(),
                venueRequest.getFields(),
                venueRequest.getImages(),
                venueRequest.getVideos(),
                venueRequest.getOperatingHours(),
                venueRequest.getPopularTimes(),
                venueRequest.getQrCodeUrl(),
                venueRequest.getTotalBookings(),
                venueRequest.getIsVerified()
        );
        return ResponseEntity.ok(DtoMapper.toVenueResponse(venue));
    }

    /**
     * Update venue
     * PUT /api/venues/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(@PathVariable Long id, @Valid @RequestBody VenueRequest venueRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Venue venue = venueService.updateVenue(
                id,
            email,
                venueRequest.getName(),
                venueRequest.getDescription(),
                venueRequest.getLocation(),
                venueRequest.getPricing(),
                venueRequest.getAmenities(),
                venueRequest.getFields(),
                venueRequest.getImages(),
                venueRequest.getVideos(),
                venueRequest.getOperatingHours(),
                venueRequest.getPopularTimes(),
                venueRequest.getQrCodeUrl(),
                venueRequest.getTotalBookings(),
                venueRequest.getIsVerified(),
                venueRequest.getStatus()
        );
        return ResponseEntity.ok(DtoMapper.toVenueResponse(venue));
    }

    /**
     * DTOs
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VenueRequest {
        @NotBlank(message = "Venue name is required")
        private String name;

        private String description;

        private Venue.Location location;

        private Venue.Pricing pricing;

        private Venue.Amenities amenities;

        private List<Venue.Field> fields;

        private List<Venue.MediaItem> images;

        private List<Venue.MediaItem> videos;

        private Map<String, Venue.OperatingHours> operatingHours;

        private List<String> popularTimes;

        private String qrCodeUrl;

        private Integer totalBookings;

        private Boolean isVerified;

        private String status;
    }
}
