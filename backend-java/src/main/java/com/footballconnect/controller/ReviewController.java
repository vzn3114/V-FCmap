package com.footballconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.Review;
import com.footballconnect.dto.DtoMapper;
import com.footballconnect.dto.ReviewResponse;
import com.footballconnect.service.ReviewService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(@RequestParam(required = false) Long venueId,
                                                   @RequestParam(required = false) Long teamId,
                                                   @RequestParam(required = false) Long userId,
                                                   @RequestParam(required = false) Long reviewerId) {
        return ResponseEntity.ok(DtoMapper.toReviewResponseList(reviewService.getReviews(venueId, teamId, userId, reviewerId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(DtoMapper.toReviewResponse(reviewService.getReviewById(id)));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Review review = reviewService.createReview(
                email,
                request.getReviewType(),
                request.getVenueId(),
                request.getTeamId(),
                request.getUserId(),
                request.getBookingId(),
                request.getRating(),
                request.getComment(),
                request.getFacilities(),
                request.getCleanliness(),
                request.getService(),
                request.getValue(),
                request.getIsVerified()
        );
        return ResponseEntity.ok(DtoMapper.toReviewResponse(review));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long id,
                                               @Valid @RequestBody UpdateReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Review review = reviewService.updateReview(
                id,
                email,
                request.getRating(),
                request.getComment(),
                request.getFacilities(),
                request.getCleanliness(),
                request.getService(),
                request.getValue(),
                request.getResponse(),
                request.getIsVerified()
        );
        return ResponseEntity.ok(DtoMapper.toReviewResponse(review));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        reviewService.deleteReview(id, email);
        return ResponseEntity.noContent().build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        @NotNull(message = "rating is required")
        @Min(value = 1, message = "rating must be >= 1")
        @Max(value = 5, message = "rating must be <= 5")
        private Integer rating;

        private String reviewType;
        private Long venueId;
        private Long teamId;
        private Long userId;
        private Long bookingId;
        private String comment;
        private Integer facilities;
        private Integer cleanliness;
        private Integer service;
        private Integer value;
        private Boolean isVerified;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateReviewRequest {
        @Min(value = 1, message = "rating must be >= 1")
        @Max(value = 5, message = "rating must be <= 5")
        private Integer rating;

        private String comment;
        private Integer facilities;
        private Integer cleanliness;
        private Integer service;
        private Integer value;
        private String response;
        private Boolean isVerified;
    }
}
