package com.footballconnect.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.footballconnect.domain.entity.Team;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ConflictException;
import com.footballconnect.exception.ForbiddenException;
import com.footballconnect.exception.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TeamService teamService;

    private User captainUser;
    private User otherUser;
    private Team testTeam;

    @BeforeEach
    void setUp() {
        captainUser = User.builder()
                .id(1L)
                .name("Captain")
                .email("captain@example.com")
                .role(User.Role.USER)
                .build();

        otherUser = User.builder()
                .id(2L)
                .name("Other User")
                .email("other@example.com")
                .role(User.Role.USER)
                .build();

        testTeam = Team.builder()
                .id(10L)
                .name("Test FC")
                .captain(captainUser)
                .tier(Team.Tier.BRONZE)
                .rankingPoints(100)
                .members(new ArrayList<>(List.of(
                        Team.TeamMember.builder().userId(1L).role(Team.MemberRole.CAPTAIN).build()
                )))
                .build();
    }

    @Test
    @DisplayName("createTeam - success")
    void createTeam_success() {
        when(userRepository.findByEmail("captain@example.com")).thenReturn(Optional.of(captainUser));
        when(teamRepository.existsByName("New Team")).thenReturn(false);
        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> {
            Team t = inv.getArgument(0);
            t.setId(20L);
            return t;
        });

        Team result = teamService.createTeam(
                "captain@example.com", "New Team", null, "Description",
                "District 1", "HCMC", null, null, true, null
        );

        assertNotNull(result);
        assertEquals("New Team", result.getName());
        assertEquals(captainUser, result.getCaptain());
        assertTrue(result.getLookingForMatch());
        verify(teamRepository).save(any(Team.class));
    }

    @Test
    @DisplayName("createTeam - duplicate name throws ConflictException")
    void createTeam_duplicateName_throwsConflict() {
        when(userRepository.findByEmail("captain@example.com")).thenReturn(Optional.of(captainUser));
        when(teamRepository.existsByName("Test FC")).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                teamService.createTeam(
                        "captain@example.com", "Test FC", null, null,
                        null, null, null, null, null, null
                )
        );
    }

    @Test
    @DisplayName("getTeamById - found")
    void getTeamById_found() {
        when(teamRepository.findById(10L)).thenReturn(Optional.of(testTeam));

        Team result = teamService.getTeamById(10L);

        assertNotNull(result);
        assertEquals("Test FC", result.getName());
    }

    @Test
    @DisplayName("getTeamById - not found throws ResourceNotFoundException")
    void getTeamById_notFound_throwsException() {
        when(teamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                teamService.getTeamById(999L)
        );
    }

    @Test
    @DisplayName("addMemberToTeam - not captain throws ForbiddenException")
    void addMemberToTeam_notCaptain_throwsForbidden() {
        when(teamRepository.findById(10L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(otherUser));

        assertThrows(ForbiddenException.class, () ->
                teamService.addMemberToTeam(10L, 3L, "other@example.com")
        );
    }

    @Test
    @DisplayName("addMemberToTeam - already member throws BadRequestException")
    void addMemberToTeam_alreadyMember_throwsBadRequest() {
        when(teamRepository.findById(10L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findByEmail("captain@example.com")).thenReturn(Optional.of(captainUser));
        when(userRepository.findById(1L)).thenReturn(Optional.of(captainUser));

        assertThrows(BadRequestException.class, () ->
                teamService.addMemberToTeam(10L, 1L, "captain@example.com")
        );
    }

    @Test
    @DisplayName("addMemberToTeam - success adds new member")
    void addMemberToTeam_success() {
        User newMember = User.builder().id(3L).name("New Member").email("new@example.com").build();

        when(teamRepository.findById(10L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findByEmail("captain@example.com")).thenReturn(Optional.of(captainUser));
        when(userRepository.findById(3L)).thenReturn(Optional.of(newMember));
        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> inv.getArgument(0));

        Team result = teamService.addMemberToTeam(10L, 3L, "captain@example.com");

        assertEquals(2, result.getMembers().size());
        verify(teamRepository).save(any(Team.class));
    }
}
