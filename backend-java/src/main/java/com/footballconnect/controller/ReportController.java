package com.footballconnect.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
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

import com.footballconnect.domain.entity.Report;
import com.footballconnect.service.ReportService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<Report>> getReports(@RequestParam(required = false) String status,
                                                   @RequestParam(required = false, defaultValue = "false") Boolean onlyMine) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(reportService.getReports(email, status, onlyMine));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(reportService.getReportById(id, email));
    }

    @PostMapping
    public ResponseEntity<Report> createReport(@Valid @RequestBody CreateReportRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Report report = reportService.createReport(
                email,
                request.getReportType(),
                request.getReportedUserId(),
                request.getReportedTeamId(),
                request.getReportedVenueId(),
                request.getReason(),
                request.getDescription(),
                request.getEvidence()
        );
        return ResponseEntity.ok(report);
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<Report> reviewReport(@PathVariable Long id,
                                               @Valid @RequestBody ReviewReportRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Report report = reportService.reviewReport(
                id,
                email,
                request.getStatus(),
                request.getReviewNotes(),
                request.getAction()
        );
        return ResponseEntity.ok(report);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        reportService.deleteReport(id, email);
        return ResponseEntity.noContent().build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReportRequest {
        private String reportType;
        private Long reportedUserId;
        private Long reportedTeamId;
        private Long reportedVenueId;
        private String reason;
        private String description;
        private String evidence;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewReportRequest {
        private String status;
        private String reviewNotes;
        private String action;
    }
}
