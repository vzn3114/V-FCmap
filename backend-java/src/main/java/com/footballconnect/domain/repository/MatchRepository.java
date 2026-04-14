package com.footballconnect.domain.repository;

import com.footballconnect.domain.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Match Repository - Data access layer for Match entity
 */
@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
}
