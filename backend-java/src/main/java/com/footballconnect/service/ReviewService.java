package com.footballconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.domain.entity.Review;
import com.footballconnect.domain.entity.Team;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.BookingRepository;
import com.footballconnect.domain.repository.ReviewRepository;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;
import com.footballconnect.exception.UnauthorizedException;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final TeamRepository teamRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         VenueRepository venueRepository,
                         TeamRepository teamRepository,
                         BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.teamRepository = teamRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Review> getReviews(Long venueId, Long teamId, Long userId, Long reviewerId) {
        if (venueId != null) {
            return reviewRepository.findByVenueId(venueId);
        }
        if (teamId != null) {
            return reviewRepository.findByTeamId(teamId);
        }
        if (userId != null) {
            return reviewRepository.findByUserId(userId);
        }
        if (reviewerId != null) {
            return reviewRepository.findByReviewerId(reviewerId);
        }
        return reviewRepository.findAll();
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    public Review createReview(String email,
                               String reviewTypeText,
                               Long venueId,
                               Long teamId,
                               Long userId,
                               Long bookingId,
                               Integer rating,
                               String comment,
                               Integer facilities,
                               Integer cleanliness,
                               Integer service,
                               Integer value,
                               Boolean verified) {
        User reviewer = findUserByEmail(email);
        Review.ReviewType reviewType = parseReviewType(reviewTypeText);

        validateRating(rating);

        Review review = Review.builder()
                .reviewer(reviewer)
                .reviewType(reviewType)
                .rating(rating)
                .comment(comment)
                .criteria(Review.ReviewCriteria.builder()
                        .facilities(facilities)
                        .cleanliness(cleanliness)
                        .service(service)
                        .value(value)
                        .build())
                .isVerified(verified != null && verified)
                .build();

        applyTarget(review, reviewType, venueId, teamId, userId);

        if (bookingId != null) {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            review.setBooking(booking);
        }

        return reviewRepository.save(review);
    }

    public Review updateReview(Long reviewId,
                               String email,
                               Integer rating,
                               String comment,
                               Integer facilities,
                               Integer cleanliness,
                               Integer service,
                               Integer value,
                               String response,
                               Boolean verified) {
        Review review = getReviewById(reviewId);
        User actor = findUserByEmail(email);

        boolean isOwner = review.getReviewer() != null && review.getReviewer().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to update this review");
        }

        if (rating != null) {
            validateRating(rating);
            review.setRating(rating);
        }
        if (comment != null) {
            review.setComment(comment);
        }

        Review.ReviewCriteria criteria = review.getCriteria() != null
                ? review.getCriteria()
                : Review.ReviewCriteria.builder().build();

        if (facilities != null) {
            criteria.setFacilities(facilities);
        }
        if (cleanliness != null) {
            criteria.setCleanliness(cleanliness);
        }
        if (service != null) {
            criteria.setService(service);
        }
        if (value != null) {
            criteria.setValue(value);
        }
        review.setCriteria(criteria);

        if (response != null && !response.isBlank()) {
            review.setResponse(response);
            review.setRespondedAt(LocalDateTime.now());
        }

        if (verified != null && isAdmin) {
            review.setIsVerified(verified);
        }

        return reviewRepository.save(review);
    }

    public void deleteReview(Long reviewId, String email) {
        Review review = getReviewById(reviewId);
        User actor = findUserByEmail(email);

        boolean isOwner = review.getReviewer() != null && review.getReviewer().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to delete this review");
        }

        reviewRepository.delete(review);
    }

    private void applyTarget(Review review,
                             Review.ReviewType type,
                             Long venueId,
                             Long teamId,
                             Long userId) {
        switch (type) {
            case VENUE -> {
                if (venueId == null) {
                    throw new BadRequestException("venueId is required for VENUE review");
                }
                Venue venue = venueRepository.findById(venueId)
                        .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
                review.setVenue(venue);
            }
            case TEAM -> {
                if (teamId == null) {
                    throw new BadRequestException("teamId is required for TEAM review");
                }
                Team team = teamRepository.findById(teamId)
                        .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
                review.setTeam(team);
            }
            case USER -> {
                if (userId == null) {
                    throw new BadRequestException("userId is required for USER review");
                }
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                review.setUser(user);
            }
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Review.ReviewType parseReviewType(String value) {
        if (value == null || value.isBlank()) {
            return Review.ReviewType.VENUE;
        }
        try {
            return Review.ReviewType.valueOf(value.toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid review type");
        }
    }

    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("rating must be in range 1..5");
        }
    }
}
