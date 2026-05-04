package com.footballconnect.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.footballconnect.domain.entity.Venue;

/**
 * Venue Repository - Data access layer for Venue entity
 */
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long>, JpaSpecificationExecutor<Venue> {

    /**
     * Find nearby venues using MySQL Haversine formula.
     * Calculates great-circle distance between given coordinates and venue location,
     * returns venues within maxDistMeters sorted by distance ascending.
     */
    @Query(value = """
            SELECT v.* FROM venues v
            WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
            AND (6371000 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(v.latitude))
                    * cos(radians(v.longitude) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(v.latitude))
                ))
            )) <= :maxDist
            ORDER BY (6371000 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(:lat)) * cos(radians(v.latitude))
                    * cos(radians(v.longitude) - radians(:lng))
                    + sin(radians(:lat)) * sin(radians(v.latitude))
                ))
            )) ASC
            """, nativeQuery = true)
    List<Venue> findNearby(@Param("lat") double lat,
                           @Param("lng") double lng,
                           @Param("maxDist") int maxDistMeters);
}
