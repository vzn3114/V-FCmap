package com.footballconnect.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.footballconnect.domain.entity.Match;
import com.footballconnect.domain.entity.Match.MatchStatus;

/**
 * Match Repository - Data access layer for Match entity
 */
@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
	List<Match> findByStatus(MatchStatus status);

	List<Match> findByHomeTeamIdOrAwayTeamId(Long homeTeamId, Long awayTeamId);
}
