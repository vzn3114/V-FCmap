package com.footballconnect.service;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.domain.specification.VenueSpecifications;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    /**
     * Search venues with flexible filtering using Specification Pattern
     */
    public List<Venue> searchVenues(String name, Double minPrice, Double maxPrice, 
                                     String district, String city, Boolean hasParking, 
                                     Boolean verified, Double minRating, String fieldType) {
        Specification<Venue> spec = Specification.where(
                VenueSpecifications.hasName(name)
                        .and(VenueSpecifications.hasPricingBetween(minPrice, maxPrice))
                        .and(VenueSpecifications.inLocation(district, city))
                        .and(VenueSpecifications.hasAmenity("parking", hasParking != null && hasParking))
                        .and(VenueSpecifications.isVerified(verified != null && verified))
                        .and(VenueSpecifications.hasMinRating(minRating))
        );

        if (fieldType != null && !fieldType.isBlank()) {
            spec = spec.and(VenueSpecifications.hasFieldType(fieldType));
        }

        return venueRepository.findAll(spec);
    }

    /**
     * Get venue by ID
     */
    public Venue getVenueById(Long venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
    }

    /**
     * Create new venue (owner only)
     */
    public Venue createVenue(String name, String description) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Venue name is required");
        }

        Venue venue = Venue.builder()
                .name(name)
                .description(description)
                .isVerified(false)
                .status(Venue.VenueStatus.PENDING_VERIFICATION)
                .build();

        return venueRepository.save(venue);
    }

    /**
     * Find nearby venues using Haversine formula
     */
    public List<Venue> getNearbyVenues(Double latitude, Double longitude, Integer maxDistance) {
        if (latitude == null || longitude == null) {
            throw new BadRequestException("Latitude and longitude are required");
        }

        int distance = maxDistance != null ? maxDistance : 5000;

        return venueRepository.findAll().stream()
                .filter(v -> {
                    if (v.getLocation() == null) return false;
                    double distInMeters = calculateDistance(
                            latitude, longitude,
                            v.getLocation().getLatitude(),
                            v.getLocation().getLongitude()
                    );
                    return distInMeters <= distance;
                })
                .toList();
    }

    /**
     * Update venue information
     */
    public Venue updateVenue(Long venueId, String name, String description) {
        Venue venue = getVenueById(venueId);

        if (name != null && !name.isBlank()) {
            venue.setName(name);
        }

        if (description != null) {
            venue.setDescription(description);
        }

        return venueRepository.save(venue);
    }

    /**
     * Verify venue (admin only)
     */
    public Venue verifyVenue(Long venueId) {
        Venue venue = getVenueById(venueId);
        venue.setIsVerified(true);
        venue.setStatus(Venue.VenueStatus.ACTIVE);
        return venueRepository.save(venue);
    }

    /**
     * Update venue amenities
     */
    public Venue updateAmenities(Long venueId, Venue.Amenities amenities) {
        Venue venue = getVenueById(venueId);
        venue.setAmenities(amenities);
        return venueRepository.save(venue);
    }

    /**
     * Update venue pricing
     */
    public Venue updatePricing(Long venueId, Venue.Pricing pricing) {
        Venue venue = getVenueById(venueId);
        venue.setPricing(pricing);
        return venueRepository.save(venue);
    }

    /**
     * Get average rating of venue by ID
     */
    public Double getVenueRating(Long venueId) {
        Venue venue = getVenueById(venueId);
        return venue.getAverageRating();
    }

    /**
     * Get all verified venues
     */
    public List<Venue> getVerifiedVenues() {
        return venueRepository.findAll(VenueSpecifications.isVerified(true));
    }

    /**
     * Haversine formula to calculate distance between two coordinates
     */
    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371000; // Radius of the earth in meters
        Double latDistance = Math.toRadians(lat2 - lat1);
        Double lonDistance = Math.toRadians(lon2 - lon1);
        Double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        Double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in meters
    }
}
