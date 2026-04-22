package com.footballconnect.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Team;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public TeamService(TeamRepository teamRepository, UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all teams with optional filtering by tier
     */
    public List<Team> getAllTeams(String tier, Integer minRankingPoints) {
        return teamRepository.findAll().stream()
                .filter(t -> tier == null || tier.isEmpty() || t.getTier().toString().equalsIgnoreCase(tier))
                .filter(t -> t.getRankingPoints() >= (minRankingPoints != null ? minRankingPoints : 0))
                .toList();
    }

    /**
     * Get team by ID
     */
    public Team getTeamById(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    /**
     * Create new team
     */
    public Team createTeam(String email,
                           String name,
                           String logo,
                           String teamDescription,
                           String activeRegionDistrict,
                           String activeRegionCity,
                           List<String> preferredPlayTime,
                           List<Team.Achievement> achievements,
                           Boolean lookingForMatch,
                           Integer fairPlayScore) {
        User captain = findUserByEmail(email);

        if (teamRepository.existsByName(name)) {
            throw new BadRequestException("Team name already exists");
        }

        Team team = Team.builder()
                .name(name)
                .logo(logo != null ? logo : "https://res.cloudinary.com/default-team-logo.png")
                .captain(captain)
                .tier(Team.Tier.BRONZE)
                .rankingPoints(0)
            .teamDescription(teamDescription)
            .activeRegion(new Team.ActiveRegion(activeRegionDistrict, activeRegionCity))
            .preferredPlayTime(preferredPlayTime != null ? preferredPlayTime : new ArrayList<>())
            .achievements(achievements)
            .lookingForMatch(lookingForMatch != null && lookingForMatch)
            .fairPlayScore(fairPlayScore != null ? fairPlayScore : 100)
                .build();

        return teamRepository.save(team);
    }

    /**
     * Update team
     */
    public Team updateTeam(Long teamId,
                           String newName,
                           String newLogo,
                           String teamDescription,
                           String activeRegionDistrict,
                           String activeRegionCity,
                           List<String> preferredPlayTime,
                           List<Team.Achievement> achievements,
                           Boolean lookingForMatch,
                           Integer fairPlayScore,
                           Boolean isVerified,
                           Boolean isBanned,
                           String banReason) {
        Team team = getTeamById(teamId);

        if (newName != null && !newName.isBlank()) {
            if (!newName.equals(team.getName()) && teamRepository.existsByName(newName)) {
                throw new BadRequestException("Team name already exists");
            }
            team.setName(newName);
        }

        if (newLogo != null && !newLogo.isBlank()) {
            team.setLogo(newLogo);
        }

        if (teamDescription != null) {
            team.setTeamDescription(teamDescription);
        }

        if (activeRegionDistrict != null || activeRegionCity != null) {
            Team.ActiveRegion activeRegion = team.getActiveRegion() != null
                    ? team.getActiveRegion()
                    : new Team.ActiveRegion();
            if (activeRegionDistrict != null) {
                activeRegion.setDistrict(activeRegionDistrict);
            }
            if (activeRegionCity != null) {
                activeRegion.setCity(activeRegionCity);
            }
            team.setActiveRegion(activeRegion);
        }

        if (preferredPlayTime != null) {
            team.setPreferredPlayTime(preferredPlayTime);
        }

        if (achievements != null) {
            team.setAchievements(achievements);
        }

        if (lookingForMatch != null) {
            team.setLookingForMatch(lookingForMatch);
        }

        if (fairPlayScore != null) {
            team.setFairPlayScore(fairPlayScore);
        }

        if (isVerified != null) {
            team.setIsVerified(isVerified);
        }

        if (isBanned != null) {
            team.setIsBanned(isBanned);
        }

        if (banReason != null) {
            team.setBanReason(banReason);
        }

        return teamRepository.save(team);
    }

    /**
     * Get team members
     */
    public List<Team.TeamMember> getTeamMembers(Long teamId) {
        Team team = getTeamById(teamId);
        return team.getMembers();
    }

    /**
     * Get teams by tier
     */
    public List<Team> getTeamsByTier(Team.Tier tier) {
        return teamRepository.findAll().stream()
                .filter(t -> t.getTier() == tier)
                .toList();
    }

    /**
     * Add member to team
     */
    public Team addMemberToTeam(Long teamId, Long userId) {
        Team team = getTeamById(teamId);
        User user = findUserById(userId);

        Team.TeamMember member = Team.TeamMember.builder()
                .userId(user.getId())
                .role(Team.MemberRole.MEMBER)
                .build();

        List<Team.TeamMember> members = new java.util.ArrayList<>(team.getMembers());
        boolean alreadyMember = members.stream().anyMatch(m -> m.getUserId().equals(userId));
        if (alreadyMember) {
            throw new BadRequestException("User is already a member of this team");
        }

        members.add(member);
        team.setMembers(members);
        return teamRepository.save(team);
    }

    /**
     * Update team tier and ranking
     */
    public Team updateTeamRanking(Long teamId, Team.Tier tier, Integer rankingPoints) {
        Team team = getTeamById(teamId);
        team.setTier(tier);
        team.setRankingPoints(rankingPoints);
        return teamRepository.save(team);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
