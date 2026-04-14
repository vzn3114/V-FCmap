package com.footballconnect.domain.specification;

import org.springframework.data.jpa.domain.Specification;

import com.footballconnect.domain.entity.Venue;

public class VenueSpecifications {

    public static Specification<Venue> hasName(String name) {
        return (root, query, cb) -> name == null || name.isBlank()
                ? cb.conjunction()
                : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Venue> hasPricingBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) return cb.conjunction();

            var pricingJoin = root.join("pricing");
            if (minPrice != null && maxPrice != null) {
                return cb.and(
                        cb.greaterThanOrEqualTo(pricingJoin.get("normalTime"), minPrice),
                        cb.lessThanOrEqualTo(pricingJoin.get("normalTime"), maxPrice)
                );
            } else if (minPrice != null) {
                return cb.greaterThanOrEqualTo(pricingJoin.get("normalTime"), minPrice);
            } else {
                return cb.lessThanOrEqualTo(pricingJoin.get("normalTime"), maxPrice);
            }
        };
    }

    public static Specification<Venue> hasAmenity(String amenityName, boolean value) {
        return (root, query, cb) -> {
            if (!value) return cb.conjunction();
            var amenitiesJoin = root.join("amenities");
            return cb.isTrue(amenitiesJoin.get(amenityName));
        };
    }

    public static Specification<Venue> inLocation(String district, String city) {
        return (root, query, cb) -> {
            if ((district == null || district.isBlank()) && (city == null || city.isBlank())) {
                return cb.conjunction();
            }
            var locationJoin = root.join("location");
            if (district != null && !district.isBlank() && city != null && !city.isBlank()) {
                return cb.and(
                        cb.equal(locationJoin.get("district"), district),
                        cb.equal(locationJoin.get("city"), city)
                );
            } else if (district != null && !district.isBlank()) {
                return cb.equal(locationJoin.get("district"), district);
            } else {
                return cb.equal(locationJoin.get("city"), city);
            }
        };
    }

    public static Specification<Venue> hasFieldType(String fieldType) {
        return (root, query, cb) -> fieldType == null || fieldType.isBlank()
                ? cb.conjunction()
                : cb.isMember(fieldType, root.get("fields"));
    }

    public static Specification<Venue> isVerified(boolean verified) {
        return (root, query, cb) -> verified
                ? cb.isTrue(root.get("isVerified"))
                : cb.conjunction();
    }

    public static Specification<Venue> hasMinRating(Double minRating) {
        return (root, query, cb) -> minRating == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("averageRating"), minRating);
    }
}
