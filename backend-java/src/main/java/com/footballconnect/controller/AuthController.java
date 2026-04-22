package com.footballconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.footballconnect.domain.entity.User;
import com.footballconnect.domain.repository.UserRepository;
import com.footballconnect.dto.AuthRequest;
import com.footballconnect.exception.BadRequestException;
import com.footballconnect.exception.ResourceNotFoundException;
import com.footballconnect.security.JwtTokenProvider;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Authentication Controller
 * Handles user login, registration, and JWT token management
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String jwt = jwtTokenProvider.generateToken(user.getId().toString(), user.getEmail(), user.getRole().toString());

        return ResponseEntity.ok(new AuthResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            jwt,
            user.getRole().toString(),
            user.getAvatar(),
            user.getPhone(),
            user.getLocation(),
            user.getPreferredPosition() != null ? user.getPreferredPosition().toString() : null,
            user.getSkillLevel() != null ? user.getSkillLevel().toString() : null,
            user.getIsVerified(),
            user.getIsBanned(),
            user.getBanReason(),
            user.getFairPlayScore(),
            user.getTotalReviews(),
            user.getAverageRating()
        ));
    }

    /**
     * Register endpoint
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .phone(registerRequest.getPhone())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(User.Role.USER)
                .avatar("https://res.cloudinary.com/default-avatar.png")
                .build();

        userRepository.save(user);

        String jwt = jwtTokenProvider.generateToken(user.getId().toString(), user.getEmail(), user.getRole().toString());

        return ResponseEntity.ok(new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                jwt,
                user.getRole().toString(),
            user.getAvatar(),
            user.getPhone(),
            user.getLocation(),
            user.getPreferredPosition() != null ? user.getPreferredPosition().toString() : null,
            user.getSkillLevel() != null ? user.getSkillLevel().toString() : null,
            user.getIsVerified(),
            user.getIsBanned(),
            user.getBanReason(),
            user.getFairPlayScore(),
            user.getTotalReviews(),
            user.getAverageRating()
        ));
    }

    /**
     * Get current user info
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new com.footballconnect.exception.UnauthorizedException("Unauthorized");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                null,
                user.getRole().toString(),
                user.getAvatar(),
                user.getPhone(),
                user.getLocation(),
                user.getPreferredPosition() != null ? user.getPreferredPosition().toString() : null,
                user.getSkillLevel() != null ? user.getSkillLevel().toString() : null,
                user.getIsVerified(),
                user.getIsBanned(),
                user.getBanReason(),
                user.getFairPlayScore(),
                user.getTotalReviews(),
                user.getAverageRating()
        ));
    }

    /**
     * Update current user profile
     * PUT /api/auth/me
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new com.footballconnect.exception.UnauthorizedException("Unauthorized");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        if (request.getPreferredPosition() != null && !request.getPreferredPosition().isBlank()) {
            user.setPreferredPosition(User.Position.valueOf(request.getPreferredPosition().toUpperCase()));
        }
        if (request.getSkillLevel() != null && !request.getSkillLevel().isBlank()) {
            user.setSkillLevel(User.SkillLevel.valueOf(request.getSkillLevel().toUpperCase()));
        }

        userRepository.save(user);

        return ResponseEntity.ok(new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                null,
                user.getRole().toString(),
                user.getAvatar(),
                user.getPhone(),
                user.getLocation(),
                user.getPreferredPosition() != null ? user.getPreferredPosition().toString() : null,
                user.getSkillLevel() != null ? user.getSkillLevel().toString() : null,
                user.getIsVerified(),
                user.getIsBanned(),
                user.getBanReason(),
                user.getFairPlayScore(),
                user.getTotalReviews(),
                user.getAverageRating()
        ));
    }

    /**
     * Simple response DTO classes
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class AuthResponse {
        private Long id;
        private String name;
        private String email;
        private String token;
        private String role;
        private String avatar;
        private String phone;
        private User.Location location;
        private String preferredPosition;
        private String skillLevel;
        private Boolean isVerified;
        private Boolean isBanned;
        private String banReason;
        private Integer fairPlayScore;
        private Integer totalReviews;
        private Double averageRating;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "name is required")
        private String name;

        @NotBlank(message = "email is required")
        @Email(message = "email is invalid")
        private String email;

        private String phone;

        @NotBlank(message = "password is required")
        @Size(min = 8, message = "password must be at least 8 characters")
        private String password;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String avatar;
        private User.Location location;
        private String preferredPosition;
        private String skillLevel;
    }
}
