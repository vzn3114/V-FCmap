package com.footballconnect.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.footballconnect.domain.entity.Review;

/**
 * Review Repository - Data access layer for Review entity
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
	List<Review> findByVenueId(Long venueId);

	List<Review> findByTeamId(Long teamId);

	List<Review> findByUserId(Long userId);

	List<Review> findByReviewerId(Long reviewerId);
}
