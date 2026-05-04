package com.footballconnect.dto;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.domain.entity.Match;
import com.footballconnect.domain.entity.Matchmaking;
import com.footballconnect.domain.entity.Report;
import com.footballconnect.domain.entity.Review;
import com.footballconnect.domain.entity.Team;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.entity.Venue;

/**
 * Centralized mapper that converts JPA entities to Response DTOs.
 * All methods are static for convenience.
 */
public final class DtoMapper {

    private DtoMapper() {
        // Utility class
    }

    // ──────────────────── User ────────────────────

    public static UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().toString() : null)
                .avatar(user.getAvatar())
                .location(toUserLocationDto(user.getLocation()))
                .preferredPosition(user.getPreferredPosition() != null ? user.getPreferredPosition().toString() : null)
                .skillLevel(user.getSkillLevel() != null ? user.getSkillLevel().toString() : null)
                .isVerified(user.getIsVerified())
                .isBanned(user.getIsBanned())
                .banReason(user.getBanReason())
                .fairPlayScore(user.getFairPlayScore())
                .totalReviews(user.getTotalReviews())
                .averageRating(user.getAverageRating())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserResponse.Summary toUserSummary(User user) {
        if (user == null) return null;
        return UserResponse.Summary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .role(user.getRole() != null ? user.getRole().toString() : null)
                .build();
    }

    private static UserResponse.LocationDto toUserLocationDto(User.Location loc) {
        if (loc == null) return null;
        return UserResponse.LocationDto.builder()
                .longitude(loc.getLongitude())
                .latitude(loc.getLatitude())
                .address(loc.getAddress())
                .district(loc.getDistrict())
                .city(loc.getCity())
                .build();
    }

    // ──────────────────── Venue ────────────────────

    public static VenueResponse toVenueResponse(Venue venue) {
        if (venue == null) return null;
        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .owner(toUserSummary(venue.getOwner()))
                .description(venue.getDescription())
                .location(toVenueLocationDto(venue.getLocation()))
                .fields(toFieldDtoList(venue.getFields()))
                .pricing(toPricingDto(venue.getPricing()))
                .amenities(toAmenitiesDto(venue.getAmenities()))
                .images(toMediaItemDtoList(venue.getImages()))
                .videos(toMediaItemDtoList(venue.getVideos()))
                .operatingHours(toOperatingHoursMap(venue.getOperatingHours()))
                .status(venue.getStatus() != null ? venue.getStatus().toString() : null)
                .isVerified(venue.getIsVerified())
                .totalReviews(venue.getTotalReviews())
                .averageRating(venue.getAverageRating())
                .totalBookings(venue.getTotalBookings())
                .popularTimes(venue.getPopularTimes())
                .qrCodeUrl(venue.getQrCodeUrl())
                .createdAt(venue.getCreatedAt())
                .updatedAt(venue.getUpdatedAt())
                .build();
    }

    public static VenueResponse.Summary toVenueSummary(Venue venue) {
        if (venue == null) return null;
        Venue.Location loc = venue.getLocation();
        return VenueResponse.Summary.builder()
                .id(venue.getId())
                .name(venue.getName())
                .district(loc != null ? loc.getDistrict() : null)
                .city(loc != null ? loc.getCity() : null)
                .build();
    }

    private static VenueResponse.LocationDto toVenueLocationDto(Venue.Location loc) {
        if (loc == null) return null;
        return VenueResponse.LocationDto.builder()
                .longitude(loc.getLongitude())
                .latitude(loc.getLatitude())
                .address(loc.getAddress())
                .district(loc.getDistrict())
                .city(loc.getCity())
                .build();
    }

    private static List<VenueResponse.FieldDto> toFieldDtoList(List<Venue.Field> fields) {
        if (fields == null) return Collections.emptyList();
        return fields.stream().map(f -> VenueResponse.FieldDto.builder()
                .name(f.getName())
                .type(f.getType() != null ? f.getType().toString() : null)
                .surfaceType(f.getSurfaceType() != null ? f.getSurfaceType().toString() : null)
                .status(f.getStatus() != null ? f.getStatus().toString() : null)
                .build()
        ).toList();
    }

    private static VenueResponse.PricingDto toPricingDto(Venue.Pricing pricing) {
        if (pricing == null) return null;
        return VenueResponse.PricingDto.builder()
                .primeTime(pricing.getPrimeTime())
                .normalTime(pricing.getNormalTime())
                .weekendRate(pricing.getWeekendRate())
                .build();
    }

    private static VenueResponse.AmenitiesDto toAmenitiesDto(Venue.Amenities amenities) {
        if (amenities == null) return null;
        return VenueResponse.AmenitiesDto.builder()
                .parking(amenities.getParking())
                .showers(amenities.getShowers())
                .changingRooms(amenities.getChangingRooms())
                .wifi(amenities.getWifi())
                .drinks(amenities.getDrinks())
                .equipmentRental(amenities.getEquipmentRental())
                .lighting(amenities.getLighting())
                .build();
    }

    private static List<VenueResponse.MediaItemDto> toMediaItemDtoList(List<Venue.MediaItem> items) {
        if (items == null) return Collections.emptyList();
        return items.stream().map(m -> VenueResponse.MediaItemDto.builder()
                .url(m.getUrl())
                .caption(m.getCaption())
                .build()
        ).toList();
    }

    private static Map<java.time.DayOfWeek, VenueResponse.OperatingHoursDto> toOperatingHoursMap(
            Map<java.time.DayOfWeek, Venue.OperatingHours> map) {
        if (map == null) return null;
        return map.entrySet().stream().collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> VenueResponse.OperatingHoursDto.builder()
                        .open(e.getValue().getOpen())
                        .close(e.getValue().getClose())
                        .build()
        ));
    }

    // ──────────────────── Booking ────────────────────

    public static BookingResponse toBookingResponse(Booking booking) {
        if (booking == null) return null;
        return BookingResponse.builder()
                .id(booking.getId())
                .venue(toVenueSummary(booking.getVenue()))
                .fieldName(booking.getFieldName())
                .fieldType(booking.getFieldType() != null ? booking.getFieldType().toString() : null)
                .bookedBy(toUserSummary(booking.getBookedBy()))
                .team(toTeamSummary(booking.getTeam()))
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus() != null ? booking.getStatus().toString() : null)
                .totalPrice(booking.getTotalPrice())
                .deposit(booking.getDeposit())
                .remainingAmount(booking.getRemainingAmount())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus().toString() : null)
                .qrCode(booking.getQrCode())
                .isCheckedIn(booking.getIsCheckedIn())
                .checkedInAt(booking.getCheckedInAt())
                .billSplits(toBillSplitDtoList(booking.getBillSplits()))
                .cancellationReason(booking.getCancellationReason())
                .cancelledAt(booking.getCancelledAt())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private static List<BookingResponse.BillSplitDto> toBillSplitDtoList(List<Booking.BillSplit> splits) {
        if (splits == null) return Collections.emptyList();
        return splits.stream().map(s -> BookingResponse.BillSplitDto.builder()
                .userId(s.getUserId())
                .amount(s.getAmount())
                .paymentStatus(s.getPaymentStatus() != null ? s.getPaymentStatus().toString() : null)
                .paidAt(s.getPaidAt())
                .build()
        ).toList();
    }

    // ──────────────────── Team ────────────────────

    public static TeamResponse toTeamResponse(Team team) {
        if (team == null) return null;
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .logo(team.getLogo())
                .captain(toUserSummary(team.getCaptain()))
                .members(toTeamMemberDtoList(team.getMembers()))
                .tier(team.getTier() != null ? team.getTier().toString() : null)
                .rankingPoints(team.getRankingPoints())
                .winningStreak(team.getWinningStreak())
                .stats(toTeamStatsDto(team.getStats()))
                .winRate(team.getWinRate())
                .fairPlayScore(team.getFairPlayScore())
                .activeRegion(toActiveRegionDto(team.getActiveRegion()))
                .preferredPlayTime(team.getPreferredPlayTime())
                .lookingForMatch(team.getLookingForMatch())
                .teamDescription(team.getTeamDescription())
                .isVerified(team.getIsVerified())
                .isBanned(team.getIsBanned())
                .banReason(team.getBanReason())
                .achievements(toAchievementDtoList(team.getAchievements()))
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .build();
    }

    public static TeamResponse.Summary toTeamSummary(Team team) {
        if (team == null) return null;
        return TeamResponse.Summary.builder()
                .id(team.getId())
                .name(team.getName())
                .logo(team.getLogo())
                .tier(team.getTier() != null ? team.getTier().toString() : null)
                .build();
    }

    private static List<TeamResponse.TeamMemberDto> toTeamMemberDtoList(List<Team.TeamMember> members) {
        if (members == null) return Collections.emptyList();
        return members.stream().map(m -> TeamResponse.TeamMemberDto.builder()
                .userId(m.getUserId())
                .role(m.getRole() != null ? m.getRole().toString() : null)
                .joinedAt(m.getJoinedAt())
                .build()
        ).toList();
    }

    private static TeamResponse.TeamStatsDto toTeamStatsDto(Team.TeamStats stats) {
        if (stats == null) return null;
        return TeamResponse.TeamStatsDto.builder()
                .totalMatches(stats.getTotalMatches())
                .wins(stats.getWins())
                .draws(stats.getDraws())
                .losses(stats.getLosses())
                .goalsScored(stats.getGoalsScored())
                .goalsConceded(stats.getGoalsConceded())
                .build();
    }

    private static TeamResponse.ActiveRegionDto toActiveRegionDto(Team.ActiveRegion region) {
        if (region == null) return null;
        return TeamResponse.ActiveRegionDto.builder()
                .district(region.getDistrict())
                .city(region.getCity())
                .build();
    }

    private static List<TeamResponse.AchievementDto> toAchievementDtoList(List<Team.Achievement> achievements) {
        if (achievements == null) return Collections.emptyList();
        return achievements.stream().map(a -> TeamResponse.AchievementDto.builder()
                .title(a.getTitle())
                .description(a.getDescription())
                .iconUrl(a.getIconUrl())
                .earnedAt(a.getEarnedAt())
                .build()
        ).toList();
    }

    // ──────────────────── Match ────────────────────

    public static MatchResponse toMatchResponse(Match match) {
        if (match == null) return null;
        return MatchResponse.builder()
                .id(match.getId())
                .homeTeam(toTeamSummary(match.getHomeTeam()))
                .awayTeam(toTeamSummary(match.getAwayTeam()))
                .venue(toVenueSummary(match.getVenue()))
                .fieldName(match.getFieldName())
                .bookingId(match.getBooking() != null ? match.getBooking().getId() : null)
                .scheduledTime(match.getScheduledTime())
                .status(match.getStatus() != null ? match.getStatus().toString() : null)
                .result(toMatchResultDto(match.getResult()))
                .isRanked(match.getIsRanked())
                .videoHighlightUrl(match.getVideoHighlightUrl())
                .notes(match.getNotes())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .build();
    }

    private static MatchResponse.MatchResultDto toMatchResultDto(Match.MatchResult result) {
        if (result == null) return null;
        return MatchResponse.MatchResultDto.builder()
                .homeScore(result.getHomeScore())
                .awayScore(result.getAwayScore())
                .resultStatus(result.getResultStatus() != null ? result.getResultStatus().toString() : null)
                .completedAt(result.getCompletedAt())
                .homePointsGained(result.getHomePointsGained())
                .awayPointsGained(result.getAwayPointsGained())
                .build();
    }

    // ──────────────────── Review ────────────────────

    public static ReviewResponse toReviewResponse(Review review) {
        if (review == null) return null;
        return ReviewResponse.builder()
                .id(review.getId())
                .reviewer(toUserSummary(review.getReviewer()))
                .reviewType(review.getReviewType() != null ? review.getReviewType().toString() : null)
                .venueId(review.getVenue() != null ? review.getVenue().getId() : null)
                .venueName(review.getVenue() != null ? review.getVenue().getName() : null)
                .teamId(review.getTeam() != null ? review.getTeam().getId() : null)
                .teamName(review.getTeam() != null ? review.getTeam().getName() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .bookingId(review.getBooking() != null ? review.getBooking().getId() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .criteria(toReviewCriteriaDto(review.getCriteria()))
                .isVerified(review.getIsVerified())
                .response(review.getResponse())
                .respondedAt(review.getRespondedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private static ReviewResponse.ReviewCriteriaDto toReviewCriteriaDto(Review.ReviewCriteria criteria) {
        if (criteria == null) return null;
        return ReviewResponse.ReviewCriteriaDto.builder()
                .facilities(criteria.getFacilities())
                .cleanliness(criteria.getCleanliness())
                .service(criteria.getService())
                .value(criteria.getValue())
                .build();
    }

    // ──────────────────── Report ────────────────────

    public static ReportResponse toReportResponse(Report report) {
        if (report == null) return null;
        return ReportResponse.builder()
                .id(report.getId())
                .reporter(toUserSummary(report.getReporter()))
                .reportType(report.getReportType() != null ? report.getReportType().toString() : null)
                .reportedUserId(report.getReportedUser() != null ? report.getReportedUser().getId() : null)
                .reportedUserName(report.getReportedUser() != null ? report.getReportedUser().getName() : null)
                .reportedTeamId(report.getReportedTeam() != null ? report.getReportedTeam().getId() : null)
                .reportedTeamName(report.getReportedTeam() != null ? report.getReportedTeam().getName() : null)
                .reportedVenueId(report.getReportedVenue() != null ? report.getReportedVenue().getId() : null)
                .reportedVenueName(report.getReportedVenue() != null ? report.getReportedVenue().getName() : null)
                .reason(report.getReason() != null ? report.getReason().toString() : null)
                .description(report.getDescription())
                .evidence(report.getEvidence())
                .status(report.getStatus() != null ? report.getStatus().toString() : null)
                .reviewedBy(toUserSummary(report.getReviewedBy()))
                .reviewNotes(report.getReviewNotes())
                .action(report.getAction())
                .reviewedAt(report.getReviewedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    // ──────────────────── Matchmaking ────────────────────

    public static MatchmakingResponse toMatchmakingResponse(Matchmaking mm) {
        if (mm == null) return null;
        return MatchmakingResponse.builder()
                .id(mm.getId())
                .team(toTeamSummary(mm.getTeam()))
                .preferredDistrict(mm.getPreferredDistrict())
                .preferredCity(mm.getPreferredCity())
                .preferredPlayTimes(mm.getPreferredPlayTimes())
                .preferredFieldType(mm.getPreferredFieldType() != null ? mm.getPreferredFieldType().toString() : null)
                .status(mm.getStatus() != null ? mm.getStatus().toString() : null)
                .minRankingPoints(mm.getMinRankingPoints())
                .maxRankingPoints(mm.getMaxRankingPoints())
                .maxDistance(mm.getMaxDistance())
                .preferredDate(mm.getPreferredDate())
                .matchedTeam(toTeamSummary(mm.getMatchedTeam()))
                .matchedAt(mm.getMatchedAt())
                .expiresAt(mm.getExpiresAt())
                .createdAt(mm.getCreatedAt())
                .build();
    }

    // ──────────────────── List helpers ────────────────────

    public static List<VenueResponse> toVenueResponseList(List<Venue> venues) {
        if (venues == null) return Collections.emptyList();
        return venues.stream().map(DtoMapper::toVenueResponse).toList();
    }

    public static List<BookingResponse> toBookingResponseList(List<Booking> bookings) {
        if (bookings == null) return Collections.emptyList();
        return bookings.stream().map(DtoMapper::toBookingResponse).toList();
    }

    public static List<TeamResponse> toTeamResponseList(List<Team> teams) {
        if (teams == null) return Collections.emptyList();
        return teams.stream().map(DtoMapper::toTeamResponse).toList();
    }

    public static List<MatchResponse> toMatchResponseList(List<Match> matches) {
        if (matches == null) return Collections.emptyList();
        return matches.stream().map(DtoMapper::toMatchResponse).toList();
    }

    public static List<ReviewResponse> toReviewResponseList(List<Review> reviews) {
        if (reviews == null) return Collections.emptyList();
        return reviews.stream().map(DtoMapper::toReviewResponse).toList();
    }

    public static List<ReportResponse> toReportResponseList(List<Report> reports) {
        if (reports == null) return Collections.emptyList();
        return reports.stream().map(DtoMapper::toReportResponse).toList();
    }

    public static List<MatchmakingResponse> toMatchmakingResponseList(List<Matchmaking> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(DtoMapper::toMatchmakingResponse).toList();
    }
}
