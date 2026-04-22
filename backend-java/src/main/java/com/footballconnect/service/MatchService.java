package com.footballconnect.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.domain.entity.Match;
import com.footballconnect.domain.entity.Team;
import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.BookingRepository;
import com.footballconnect.domain.repository.MatchRepository;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;

    public MatchService(MatchRepository matchRepository,
                        TeamRepository teamRepository,
                        VenueRepository venueRepository,
                        BookingRepository bookingRepository) {
        this.matchRepository = matchRepository;
        this.teamRepository = teamRepository;
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Match> getMatches(String statusText, Long teamId) {
        if (statusText != null && !statusText.isBlank()) {
            Match.MatchStatus status = parseMatchStatus(statusText);
            return matchRepository.findByStatus(status);
        }

        if (teamId != null) {
            return matchRepository.findByHomeTeamIdOrAwayTeamId(teamId, teamId);
        }

        return matchRepository.findAll();
    }

    public Match getMatchById(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
    }

    public Match createMatch(Long homeTeamId,
                             Long awayTeamId,
                             Long venueId,
                             String fieldName,
                             Long bookingId,
                             String scheduledTimeText,
                             String notes,
                             Boolean ranked) {
        Team homeTeam = findTeam(homeTeamId, "Home team not found");
        Team awayTeam = findTeam(awayTeamId, "Away team not found");

        if (homeTeam.getId().equals(awayTeam.getId())) {
            throw new BadRequestException("Home team and away team must be different");
        }

        Venue venue = venueId != null ? findVenue(venueId) : null;
        Booking booking = bookingId != null ? findBooking(bookingId) : null;
        LocalDateTime scheduledTime = parseDateTime(scheduledTimeText, "Invalid scheduledTime format");

        Match match = Match.builder()
                .homeTeam(homeTeam)
                .awayTeam(awayTeam)
                .venue(venue)
                .fieldName(fieldName)
                .booking(booking)
                .scheduledTime(scheduledTime)
                .status(Match.MatchStatus.SCHEDULED)
                .isRanked(ranked == null || ranked)
                .notes(notes)
                .build();

        return matchRepository.save(match);
    }

    public Match updateMatch(Long id,
                             Long venueId,
                             String fieldName,
                             String scheduledTimeText,
                             String statusText,
                             String videoHighlightUrl,
                             String notes,
                             Boolean ranked) {
        Match match = getMatchById(id);

        if (venueId != null) {
            match.setVenue(findVenue(venueId));
        }
        if (fieldName != null) {
            match.setFieldName(fieldName);
        }
        if (scheduledTimeText != null && !scheduledTimeText.isBlank()) {
            match.setScheduledTime(parseDateTime(scheduledTimeText, "Invalid scheduledTime format"));
        }
        if (statusText != null && !statusText.isBlank()) {
            match.setStatus(parseMatchStatus(statusText));
        }
        if (videoHighlightUrl != null) {
            match.setVideoHighlightUrl(videoHighlightUrl);
        }
        if (notes != null) {
            match.setNotes(notes);
        }
        if (ranked != null) {
            match.setIsRanked(ranked);
        }

        return matchRepository.save(match);
    }

    public Match updateResult(Long id,
                              Integer homeScore,
                              Integer awayScore,
                              String resultStatusText,
                              Integer homePointsGained,
                              Integer awayPointsGained) {
        Match match = getMatchById(id);

        Match.MatchResult currentResult = match.getResult() != null
                ? match.getResult()
                : Match.MatchResult.builder().build();

        currentResult.setHomeScore(homeScore);
        currentResult.setAwayScore(awayScore);
        currentResult.setResultStatus(parseResultStatus(resultStatusText));
        currentResult.setHomePointsGained(homePointsGained);
        currentResult.setAwayPointsGained(awayPointsGained);
        currentResult.setCompletedAt(LocalDateTime.now());

        match.setResult(currentResult);

        if (currentResult.getResultStatus() == Match.ResultStatus.CONFIRMED
                || currentResult.getResultStatus() == Match.ResultStatus.RESOLVED) {
            match.setStatus(Match.MatchStatus.COMPLETED);
        }

        return matchRepository.save(match);
    }

    public void deleteMatch(Long id) {
        Match match = getMatchById(id);
        matchRepository.delete(match);
    }

    private Team findTeam(Long teamId, String message) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(message));
    }

    private Venue findVenue(Long venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
    }

    private Booking findBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private LocalDateTime parseDateTime(String value, String errorMessage) {
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ex) {
            throw new BadRequestException(errorMessage);
        }
    }

    private Match.MatchStatus parseMatchStatus(String statusText) {
        try {
            return Match.MatchStatus.valueOf(statusText.toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid match status");
        }
    }

    private Match.ResultStatus parseResultStatus(String statusText) {
        if (statusText == null || statusText.isBlank()) {
            return Match.ResultStatus.PENDING;
        }
        try {
            return Match.ResultStatus.valueOf(statusText.toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid match result status");
        }
    }
}
