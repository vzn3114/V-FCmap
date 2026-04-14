package com.footballconnect.domain.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.domain.entity.Booking.BookingStatus;

/**
 * Booking Repository - Data access layer for Booking entity
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

		List<Booking> findByBookedById(Long bookedById);

		@Query("""
						SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
						FROM Booking b
						WHERE b.venue.id = :venueId
							AND b.fieldName = :fieldName
							AND b.status IN :activeStatuses
							AND b.startTime < :endTime
							AND b.endTime > :startTime
						""")
		boolean existsOverlappingBooking(@Param("venueId") Long venueId,
																		 @Param("fieldName") String fieldName,
																		 @Param("startTime") LocalDateTime startTime,
																		 @Param("endTime") LocalDateTime endTime,
																		 @Param("activeStatuses") List<BookingStatus> activeStatuses);
}
