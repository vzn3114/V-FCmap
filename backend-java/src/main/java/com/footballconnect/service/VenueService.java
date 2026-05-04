package com.footballconnect.service;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.domain.specification.VenueSpecifications;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ForbiddenException;
import com.footballconnect.exception.ResourceNotFoundException;

@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    public VenueService(VenueRepository venueRepository, UserRepository userRepository) {
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
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
    public Venue createVenue(String ownerEmail,
                             String name,
                             String description,
                             Venue.Location location,
                             Venue.Pricing pricing,
                             Venue.Amenities amenities,
                             List<Venue.Field> fields,
                             List<Venue.MediaItem> images,
                             List<Venue.MediaItem> videos,
                             Map<String, Venue.OperatingHours> operatingHours,
                             List<String> popularTimes,
                             String qrCodeUrl,
                             Integer totalBookings,
                             Boolean verified) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Venue name is required");
        }

        User owner = findUserByEmail(ownerEmail);

        Venue venue = Venue.builder()
                .name(name)
            .owner(owner)
                .description(description)
                .location(location)
                .pricing(pricing)
                .amenities(amenities != null ? amenities : Venue.Amenities.builder().build())
                .fields(fields != null ? fields : new ArrayList<>())
                .images(images != null ? images : new ArrayList<>())
                .videos(videos != null ? videos : new ArrayList<>())
                .operatingHours(parseOperatingHours(operatingHours))
                .popularTimes(popularTimes != null ? popularTimes : new ArrayList<>())
                .qrCodeUrl(qrCodeUrl)
                .totalBookings(totalBookings != null ? totalBookings : 0)
                .isVerified(verified != null && verified)
                .status(verified != null && verified ? Venue.VenueStatus.ACTIVE : Venue.VenueStatus.PENDING_VERIFICATION)
                .build();

        return venueRepository.save(venue);
    }

    /**
     * Find nearby venues using native MySQL Haversine query.
     * Distance calculation is performed in the database for optimal performance.
     */
    public List<Venue> getNearbyVenues(Double latitude, Double longitude, Integer maxDistance) {
        if (latitude == null || longitude == null) {
            throw new BadRequestException("Latitude and longitude are required");
        }

        int distance = maxDistance != null ? maxDistance : 5000;

        return venueRepository.findNearby(latitude, longitude, distance);
    }

    /**
     * Update venue information
     */
    public Venue updateVenue(Long venueId,
                             String actorEmail,
                             String name,
                             String description,
                             Venue.Location location,
                             Venue.Pricing pricing,
                             Venue.Amenities amenities,
                             List<Venue.Field> fields,
                             List<Venue.MediaItem> images,
                             List<Venue.MediaItem> videos,
                             Map<String, Venue.OperatingHours> operatingHours,
                             List<String> popularTimes,
                             String qrCodeUrl,
                             Integer totalBookings,
                             Boolean verified,
                             String statusText) {
        User actor = findUserByEmail(actorEmail);
        Venue venue = getVenueById(venueId);
        ensureCanManageVenue(venue, actor);

        if (name != null && !name.isBlank()) {
            venue.setName(name);
        }

        if (description != null) {
            venue.setDescription(description);
        }

        if (location != null) {
            venue.setLocation(location);
        }

        if (pricing != null) {
            venue.setPricing(pricing);
        }

        if (amenities != null) {
            venue.setAmenities(amenities);
        }

        if (fields != null) {
            venue.setFields(fields);
        }

        if (images != null) {
            venue.setImages(images);
        }

        if (videos != null) {
            venue.setVideos(videos);
        }

        if (operatingHours != null) {
            venue.setOperatingHours(parseOperatingHours(operatingHours));
        }

        if (popularTimes != null) {
            venue.setPopularTimes(popularTimes);
        }

        if (qrCodeUrl != null) {
            venue.setQrCodeUrl(qrCodeUrl);
        }

        if (totalBookings != null) {
            venue.setTotalBookings(totalBookings);
        }

        if (verified != null) {
            venue.setIsVerified(verified);
            if (verified) {
                venue.setStatus(Venue.VenueStatus.ACTIVE);
            }
        }

        if (statusText != null && !statusText.isBlank()) {
            try {
                venue.setStatus(Venue.VenueStatus.valueOf(statusText.toUpperCase()));
            } catch (Exception ex) {
                throw new BadRequestException("Invalid venue status");
            }
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

    private Map<DayOfWeek, Venue.OperatingHours> parseOperatingHours(Map<String, Venue.OperatingHours> rawMap) {
        if (rawMap == null) {
            return null;
        }

        try {
            return rawMap.entrySet().stream()
                    .collect(Collectors.toMap(
                            entry -> DayOfWeek.valueOf(entry.getKey().toUpperCase()),
                            Map.Entry::getValue
                    ));
        } catch (Exception ex) {
            throw new BadRequestException("Invalid operating hours map. Use MONDAY..SUNDAY keys");
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureCanManageVenue(Venue venue, User actor) {
        if (actor.getRole() == User.Role.ADMIN) {
            return;
        }

        if (actor.getRole() != User.Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owner can update venue");
        }

        Long ownerId = venue.getOwner() != null ? venue.getOwner().getId() : null;
        if (ownerId == null || !ownerId.equals(actor.getId())) {
            throw new ForbiddenException("Only venue owner can update venue");
        }
    }
}
