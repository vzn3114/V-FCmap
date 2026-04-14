package com.footballconnect.domain.repository;

import com.footballconnect.domain.entity.Matchmaking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Matchmaking Repository - Data access layer for Matchmaking entity
 */
@Repository
public interface MatchmakingRepository extends JpaRepository<Matchmaking, Long> {
}
