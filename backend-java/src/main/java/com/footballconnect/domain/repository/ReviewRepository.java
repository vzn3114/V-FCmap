package com.footballconnect.domain.repository;

import com.footballconnect.domain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Review Repository - Data access layer for Review entity
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
}
