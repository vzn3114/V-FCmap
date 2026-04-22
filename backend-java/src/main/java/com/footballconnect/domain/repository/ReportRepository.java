package com.footballconnect.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.footballconnect.domain.entity.Report;
import com.footballconnect.domain.entity.Report.ReportStatus;

/**
 * Report Repository - Data access layer for Report entity
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
	List<Report> findByStatus(ReportStatus status);

	List<Report> findByReporterId(Long reporterId);
}
