package com.footballconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.footballconnect.domain.entity.Report;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.repository.ReportRepository;
import com.footballconnect.domain.repository.TeamRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;
import com.footballconnect.exception.UnauthorizedException;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final VenueRepository venueRepository;

    public ReportService(ReportRepository reportRepository,
                         UserRepository userRepository,
                         TeamRepository teamRepository,
                         VenueRepository venueRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.venueRepository = venueRepository;
    }

    public List<Report> getReports(String email, String statusText, Boolean onlyMine) {
        User actor = findUserByEmail(email);

        if (Boolean.TRUE.equals(onlyMine)) {
            return reportRepository.findByReporterId(actor.getId());
        }

        if (statusText != null && !statusText.isBlank()) {
            Report.ReportStatus status = parseStatus(statusText);
            return reportRepository.findByStatus(status);
        }

        if (actor.getRole() != User.Role.ADMIN) {
            return reportRepository.findByReporterId(actor.getId());
        }

        return reportRepository.findAll();
    }

    public Report getReportById(Long id, String email) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User actor = findUserByEmail(email);

        boolean isOwner = report.getReporter() != null && report.getReporter().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to access this report");
        }

        return report;
    }

    public Report createReport(String email,
                               String reportTypeText,
                               Long reportedUserId,
                               Long reportedTeamId,
                               Long reportedVenueId,
                               String reasonText,
                               String description,
                               String evidence) {
        User reporter = findUserByEmail(email);
        Report.ReportType type = parseType(reportTypeText);

        Report report = Report.builder()
                .reporter(reporter)
                .reportType(type)
                .reason(parseReason(reasonText))
                .description(description)
                .evidence(evidence)
                .status(Report.ReportStatus.PENDING)
                .build();

        switch (type) {
            case USER -> {
                if (reportedUserId == null) {
                    throw new BadRequestException("reportedUserId is required for USER report");
                }
                report.setReportedUser(userRepository.findById(reportedUserId)
                        .orElseThrow(() -> new ResourceNotFoundException("Reported user not found")));
            }
            case TEAM -> {
                if (reportedTeamId == null) {
                    throw new BadRequestException("reportedTeamId is required for TEAM report");
                }
                report.setReportedTeam(teamRepository.findById(reportedTeamId)
                        .orElseThrow(() -> new ResourceNotFoundException("Reported team not found")));
            }
            case VENUE -> {
                if (reportedVenueId == null) {
                    throw new BadRequestException("reportedVenueId is required for VENUE report");
                }
                report.setReportedVenue(venueRepository.findById(reportedVenueId)
                        .orElseThrow(() -> new ResourceNotFoundException("Reported venue not found")));
            }
        }

        return reportRepository.save(report);
    }

    public Report reviewReport(Long reportId,
                               String email,
                               String statusText,
                               String reviewNotes,
                               String action) {
        User reviewer = findUserByEmail(email);
        if (reviewer.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only admin can review reports");
        }

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        if (statusText != null && !statusText.isBlank()) {
            report.setStatus(parseStatus(statusText));
        }
        report.setReviewedBy(reviewer);
        report.setReviewNotes(reviewNotes);
        report.setAction(action);
        report.setReviewedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    public void deleteReport(Long reportId, String email) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User actor = findUserByEmail(email);

        boolean isOwner = report.getReporter() != null && report.getReporter().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to delete this report");
        }

        reportRepository.delete(report);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Report.ReportType parseType(String value) {
        if (value == null || value.isBlank()) {
            return Report.ReportType.USER;
        }
        try {
            return Report.ReportType.valueOf(value.toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid report type");
        }
    }

    private Report.ReportReason parseReason(String value) {
        if (value == null || value.isBlank()) {
            return Report.ReportReason.OTHER;
        }
        try {
            return Report.ReportReason.valueOf(value.toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid report reason");
        }
    }

    private Report.ReportStatus parseStatus(String value) {
        try {
            return Report.ReportStatus.valueOf(value.toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid report status");
        }
    }
}
