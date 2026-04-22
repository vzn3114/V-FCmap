package com.footballconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.Team;
import com.footballconnect.service.TeamService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Team Controller
 * Handles team management operations
 */
@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    /**
     * Get all teams with optional filtering
     * GET /api/teams
     */
    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams(
            @RequestParam(required = false) String tier,
            @RequestParam(required = false, defaultValue = "0") Integer minRankingPoints) {
        List<Team> teams = teamService.getAllTeams(tier, minRankingPoints);
        return ResponseEntity.ok(teams);
    }

    /**
     * Get team by ID
     * GET /api/teams/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        Team team = teamService.getTeamById(id);
        return ResponseEntity.ok(team);
    }

    /**
     * Create new team
     * POST /api/teams
     */
    @PostMapping
    public ResponseEntity<?> createTeam(@Valid @RequestBody TeamRequest teamRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Team team = teamService.createTeam(
                email,
                teamRequest.getName(),
                teamRequest.getLogo(),
                teamRequest.getTeamDescription(),
                teamRequest.getActiveRegionDistrict(),
                teamRequest.getActiveRegionCity(),
                teamRequest.getPreferredPlayTime(),
                teamRequest.getAchievements(),
                teamRequest.getLookingForMatch(),
                teamRequest.getFairPlayScore()
        );
        return ResponseEntity.ok(team);
    }

    /**
     * Update team
     * PUT /api/teams/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeam(@PathVariable Long id, @Valid @RequestBody TeamRequest teamRequest) {
        Team team = teamService.updateTeam(
                id,
                teamRequest.getName(),
                teamRequest.getLogo(),
                teamRequest.getTeamDescription(),
                teamRequest.getActiveRegionDistrict(),
                teamRequest.getActiveRegionCity(),
                teamRequest.getPreferredPlayTime(),
                teamRequest.getAchievements(),
                teamRequest.getLookingForMatch(),
                teamRequest.getFairPlayScore(),
                teamRequest.getIsVerified(),
                teamRequest.getIsBanned(),
                teamRequest.getBanReason()
        );
        return ResponseEntity.ok(team);
    }

    /**
     * Get team members
     * GET /api/teams/{id}/members
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<?> getTeamMembers(@PathVariable Long id) {
        List<Team.TeamMember> members = teamService.getTeamMembers(id);
        return ResponseEntity.ok(members);
    }

    /**
     * Get teams by tier
     * GET /api/teams/tier/{tier}
     */
    @GetMapping("/tier/{tier}")
    public ResponseEntity<List<Team>> getTeamsByTier(@PathVariable String tier) {
        try {
            Team.Tier tierEnum = Team.Tier.valueOf(tier.toUpperCase());
            List<Team> teams = teamService.getTeamsByTier(tierEnum);
            return ResponseEntity.ok(teams);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * DTOs
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamRequest {
        @NotBlank(message = "Team name is required")
        private String name;

        private String logo;

        private String teamDescription;

        private String activeRegionDistrict;

        private String activeRegionCity;

        private List<String> preferredPlayTime;

        private List<Team.Achievement> achievements;

        private Boolean lookingForMatch;

        private Integer fairPlayScore;

        private Boolean isVerified;

        private Boolean isBanned;

        private String banReason;
    }
}
