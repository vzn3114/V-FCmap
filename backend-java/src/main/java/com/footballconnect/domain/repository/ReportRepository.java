package com.footballconnect.domain.repository;

import com.footballconnect.domain.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Report Repository - Data access layer for Report entity
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
}
