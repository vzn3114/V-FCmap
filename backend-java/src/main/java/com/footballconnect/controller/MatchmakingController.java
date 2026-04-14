package com.footballconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.Matchmaking;
import com.footballconnect.service.MatchmakingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Matchmaking Controller
 * Handles opponent matching and challenge requests
 */
@RestController
@RequestMapping("/api/matchmaking")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    /**
     * Find opponent based on search criteria
     * POST /api/matchmaking/find-opponent
     */
    @PostMapping("/find-opponent")
    public ResponseEntity<?> findOpponent(@Valid @RequestBody SearchCriteria searchCriteria) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<TeamMatch> matches = matchmakingService.findOpponents(email, searchCriteria.getTier(), searchCriteria.getMinRankingPoints(), searchCriteria.getMaxRankingPoints()).stream()
                .map(opponent -> new TeamMatch(
                        opponent.getId(),
                        opponent.getName(),
                        opponent.getTier().toString(),
                        opponent.getRankingPoints(),
                        opponent.getLogo()
                ))
                .toList();
        return ResponseEntity.ok(matches);
    }

    /**
     * Get match suggestions for a team
     * GET /api/matchmaking/suggestions
     */
    @GetMapping("/suggestions")
    public ResponseEntity<?> getSuggestions(@RequestParam @NotNull Long teamId,
            @RequestParam(defaultValue = "500") Integer rankingProximity) {
        List<TeamMatch> matches = matchmakingService.getSuggestions(teamId, rankingProximity).stream()
                .map(opponent -> new TeamMatch(
                        opponent.getId(),
                        opponent.getName(),
                        opponent.getTier().toString(),
                        opponent.getRankingPoints(),
                        opponent.getLogo()
                ))
                .toList();
        return ResponseEntity.ok(matches);
    }

    /**
     * Send challenge to opponent team
     * POST /api/matchmaking/challenge
     */
    @PostMapping("/challenge")
    public ResponseEntity<?> sendChallenge(@Valid @RequestBody ChallengeRequest challengeRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Matchmaking matchmaking = matchmakingService.sendChallenge(email, challengeRequest.getOpponentTeamId());
        return ResponseEntity.ok(new ChallengeResponse(
                matchmaking.getId(),
                "Challenge sent successfully",
                challengeRequest.getOpponentTeamId(),
                ""
        ));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchCriteria {
        private String tier;
        private Integer minRankingPoints;
        private Integer maxRankingPoints;
        private String preferredLocation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMatch {
        private Long id;
        private String name;
        private String tier;
        private Integer rankingPoints;
        private String logo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeRequest {
        @NotNull(message = "Opponent team ID is required")
        private Long opponentTeamId;
    }

    @Data
    @AllArgsConstructor
    public static class ChallengeResponse {
        private Long matchmakingId;
        private String message;
        private Long opponentTeamId;
        private String opponentTeamName;
    }
}
