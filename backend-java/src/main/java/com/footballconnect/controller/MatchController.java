package com.footballconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.Match;
import com.footballconnect.dto.DtoMapper;
import com.footballconnect.dto.MatchResponse;
import com.footballconnect.service.MatchService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getMatches(@RequestParam(required = false) String status,
                                                  @RequestParam(required = false) Long teamId) {
        return ResponseEntity.ok(DtoMapper.toMatchResponseList(matchService.getMatches(status, teamId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatchById(@PathVariable Long id) {
        return ResponseEntity.ok(DtoMapper.toMatchResponse(matchService.getMatchById(id)));
    }

    @PostMapping
    public ResponseEntity<MatchResponse> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        Match match = matchService.createMatch(
                request.getHomeTeamId(),
                request.getAwayTeamId(),
                request.getVenueId(),
                request.getFieldName(),
                request.getBookingId(),
                request.getScheduledTime(),
                request.getNotes(),
                request.getIsRanked()
        );
        return ResponseEntity.ok(DtoMapper.toMatchResponse(match));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MatchResponse> updateMatch(@PathVariable Long id,
                                             @Valid @RequestBody UpdateMatchRequest request) {
        Match match = matchService.updateMatch(
                id,
                request.getVenueId(),
                request.getFieldName(),
                request.getScheduledTime(),
                request.getStatus(),
                request.getVideoHighlightUrl(),
                request.getNotes(),
                request.getIsRanked()
        );
        return ResponseEntity.ok(DtoMapper.toMatchResponse(match));
    }

    @PutMapping("/{id}/result")
    public ResponseEntity<MatchResponse> updateResult(@PathVariable Long id,
                                              @Valid @RequestBody MatchResultRequest request) {
        Match match = matchService.updateResult(
                id,
                request.getHomeScore(),
                request.getAwayScore(),
                request.getResultStatus(),
                request.getHomePointsGained(),
                request.getAwayPointsGained()
        );
        return ResponseEntity.ok(DtoMapper.toMatchResponse(match));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long id) {
        matchService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateMatchRequest {
        @NotNull(message = "homeTeamId is required")
        private Long homeTeamId;

        @NotNull(message = "awayTeamId is required")
        private Long awayTeamId;

        private Long venueId;

        private String fieldName;

        private Long bookingId;

        @NotBlank(message = "scheduledTime is required")
        private String scheduledTime;

        private String notes;

        private Boolean isRanked;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMatchRequest {
        private Long venueId;
        private String fieldName;
        private String scheduledTime;
        private String status;
        private String videoHighlightUrl;
        private String notes;
        private Boolean isRanked;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchResultRequest {
        private Integer homeScore;
        private Integer awayScore;
        private String resultStatus;
        private Integer homePointsGained;
        private Integer awayPointsGained;
    }
}
