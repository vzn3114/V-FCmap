package com.footballconnect.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.Booking;
import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.entity.Venue;
import com.footballconnect.domain.repository.BookingRepository;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.domain.repository.VenueRepository;
import com.footballconnect.dto.BookingResponse;
import com.footballconnect.dto.DtoMapper;
import com.footballconnect.dto.UserResponse;
import com.footballconnect.dto.VenueResponse;
import com.footballconnect.exception.ResourceNotFoundException;
import com.footballconnect.exception.UnauthorizedException;

/**
 * Admin Controller — secured behind /api/admin/** (ADMIN role only via SecurityConfig)
 * Provides system-wide management: users, bookings, venues, stats.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;

    public AdminController(UserRepository userRepository,
                           BookingRepository bookingRepository,
                           VenueRepository venueRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.venueRepository = venueRepository;
    }

    // ────────────────────────────────────────────
    //  USERS
    // ────────────────────────────────────────────

    /**
     * GET /api/admin/users — list all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> dtos = users.stream()
                .map(DtoMapper::toUserResponse)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * PUT /api/admin/users/{id}/ban — ban a user
     */
    @PutMapping("/users/{id}/ban")
    public ResponseEntity<UserResponse> banUser(@PathVariable Long id,
                                                 @RequestBody(required = false) BanRequest req) {
        User admin = getCurrentUser();
        if (id.equals(admin.getId())) {
            throw new UnauthorizedException("Cannot ban yourself");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == User.Role.ADMIN) {
            throw new UnauthorizedException("Cannot ban an admin account");
        }
        user.setIsBanned(true);
        user.setBanReason(req != null && req.getReason() != null ? req.getReason() : "Violated platform rules");
        userRepository.save(user);
        return ResponseEntity.ok(DtoMapper.toUserResponse(user));
    }

    /**
     * PUT /api/admin/users/{id}/unban — unban a user
     */
    @PutMapping("/users/{id}/unban")
    public ResponseEntity<UserResponse> unbanUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsBanned(false);
        user.setBanReason(null);
        userRepository.save(user);
        return ResponseEntity.ok(DtoMapper.toUserResponse(user));
    }

    /**
     * PUT /api/admin/users/{id}/role — update user role
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable Long id,
                                                        @RequestBody RoleRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        try {
            user.setRole(User.Role.valueOf(req.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new com.footballconnect.exception.BadRequestException("Invalid role: " + req.getRole());
        }
        userRepository.save(user);
        return ResponseEntity.ok(DtoMapper.toUserResponse(user));
    }

    // ────────────────────────────────────────────
    //  BOOKINGS
    // ────────────────────────────────────────────

    /**
     * GET /api/admin/bookings — list ALL bookings (admin view)
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return ResponseEntity.ok(DtoMapper.toBookingResponseList(bookings));
    }

    // ────────────────────────────────────────────
    //  STATS
    // ────────────────────────────────────────────

    /**
     * GET /api/admin/stats — quick system stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers",    userRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalVenues",   venueRepository.count());
        long bannedUsers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIsBanned())).count();
        stats.put("bannedUsers", bannedUsers);
        return ResponseEntity.ok(stats);
    }

    // ────────────────────────────────────────────
    //  Helpers
    // ────────────────────────────────────────────

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    // ────────────────────────────────────────────
    //  Inner DTOs
    // ────────────────────────────────────────────

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BanRequest {
        private String reason;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class RoleRequest {
        private String role;
    }
}
