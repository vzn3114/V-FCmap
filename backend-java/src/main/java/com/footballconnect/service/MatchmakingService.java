package com.footballconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Matchmaking;
import com.footballconnect.domain.entity.Team;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.repository.MatchmakingRepository;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;

@Service
public class MatchmakingService {

    private final MatchmakingRepository matchmakingRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public MatchmakingService(MatchmakingRepository matchmakingRepository,
                              TeamRepository teamRepository,
                              UserRepository userRepository) {
        this.matchmakingRepository = matchmakingRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    /**
     * Find opponents based on search criteria
     */
    public List<Team> findOpponents(String email, String tier, Integer minRankingPoints, Integer maxRankingPoints) {
        User user = findUserByEmail(email);
        
        return teamRepository.findAll().stream()
                .filter(t -> !t.getCaptain().getId().equals(user.getId()))
                .filter(t -> tier == null || tier.isEmpty() || t.getTier().toString().equalsIgnoreCase(tier))
                .filter(t -> minRankingPoints == null || t.getRankingPoints() >= minRankingPoints)
                .filter(t -> maxRankingPoints == null || t.getRankingPoints() <= maxRankingPoints)
                .toList();
    }

    /**
     * Get match suggestions for a team based on ranking points proximity
     */
    public List<Team> getSuggestions(Long teamId, Integer rankingProximity) {
        Team team = findTeamById(teamId);
        int proximity = rankingProximity != null ? rankingProximity : 500;

        return teamRepository.findAll().stream()
                .filter(t -> !t.getId().equals(teamId))
                .filter(t -> Math.abs(t.getRankingPoints() - team.getRankingPoints()) <= proximity)
                .toList();
    }

    /**
     * Create a matchmaking request (challenge)
     */
    public Matchmaking sendChallenge(String email, Long opponentTeamId) {
        User user = findUserByEmail(email);
        Team opponentTeam = findTeamById(opponentTeamId);

        if (opponentTeam.getCaptain().getId().equals(user.getId())) {
            throw new BadRequestException("Cannot send challenge to your own team");
        }

        Matchmaking matchmaking = Matchmaking.builder()
                .team(null) // Will be set when user's team is specific
                .matchedTeam(opponentTeam)
                .status(Matchmaking.MatchmakingStatus.ACTIVE)
                .preferredDate(LocalDateTime.now().plusDays(7))
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(3))
                .build();

        return matchmakingRepository.save(matchmaking);
    }

    /**
     * Accept a matchmaking challenge
     */
    public Matchmaking acceptChallenge(Long matchmakingId, Long teamId) {
        Matchmaking matchmaking = findMatchmakingById(matchmakingId);
        Team acceptingTeam = findTeamById(teamId);

        if (!matchmaking.getStatus().equals(Matchmaking.MatchmakingStatus.ACTIVE)) {
            throw new BadRequestException("Matchmaking is not in active state");
        }

        matchmaking.setTeam(acceptingTeam);
        matchmaking.setStatus(Matchmaking.MatchmakingStatus.MATCHED);
        matchmaking.setMatchedAt(LocalDateTime.now());

        return matchmakingRepository.save(matchmaking);
    }

    /**
     * Decline a matchmaking challenge
     */
    public Matchmaking declineChallenge(Long matchmakingId) {
        Matchmaking matchmaking = findMatchmakingById(matchmakingId);
        matchmaking.setStatus(Matchmaking.MatchmakingStatus.CANCELLED);
        return matchmakingRepository.save(matchmaking);
    }

    /**
     * Get all active matchmaking requests
     */
    public List<Matchmaking> getActiveMatchmaking() {
        return matchmakingRepository.findAll().stream()
                .filter(m -> m.getStatus().equals(Matchmaking.MatchmakingStatus.ACTIVE))
                .filter(m -> m.getExpiresAt() == null || m.getExpiresAt().isAfter(LocalDateTime.now()))
                .toList();
    }

    /**
     * Get matched games
     */
    public List<Matchmaking> getMatchedGames(Long teamId) {
        Team team = findTeamById(teamId);
        return matchmakingRepository.findAll().stream()
                .filter(m -> m.getStatus().equals(Matchmaking.MatchmakingStatus.MATCHED))
                .filter(m -> m.getTeam() != null && m.getTeam().getId().equals(teamId) 
                          || m.getMatchedTeam() != null && m.getMatchedTeam().getId().equals(teamId))
                .toList();
    }

    /**
     * Cancel expired matchmaking
     */
    public void cancelExpiredMatchmaking() {
        LocalDateTime now = LocalDateTime.now();
        matchmakingRepository.findAll().stream()
                .filter(m -> m.getStatus().equals(Matchmaking.MatchmakingStatus.ACTIVE))
                .filter(m -> m.getExpiresAt() != null && m.getExpiresAt().isBefore(now))
                .forEach(m -> {
                    m.setStatus(Matchmaking.MatchmakingStatus.EXPIRED);
                    matchmakingRepository.save(m);
                });
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Team findTeamById(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    private Matchmaking findMatchmakingById(Long matchmakingId) {
        return matchmakingRepository.findById(matchmakingId)
                .orElseThrow(() -> new ResourceNotFoundException("Matchmaking not found"));
    }
}
