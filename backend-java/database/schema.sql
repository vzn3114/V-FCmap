-- Football Connect Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS football_connect 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE football_connect;

-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    avatar VARCHAR(500) DEFAULT 'https://res.cloudinary.com/default-avatar.png',
    
    -- Location (Embedded)
    longitude DOUBLE,
    latitude DOUBLE,
    address VARCHAR(500),
    district VARCHAR(100),
    city VARCHAR(100),
    
    preferred_position VARCHAR(50) DEFAULT 'ANY',
    skill_level VARCHAR(50) DEFAULT 'INTERMEDIATE',
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason VARCHAR(500),
    fair_play_score INT DEFAULT 100,
    total_reviews INT DEFAULT 0,
    average_rating DOUBLE DEFAULT 5.0,
    
    reset_password_token VARCHAR(255),
    reset_password_expire DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teams Table
CREATE TABLE teams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    logo VARCHAR(500) DEFAULT 'https://res.cloudinary.com/default-team-logo.png',
    captain_id BIGINT,
    tier VARCHAR(50) DEFAULT 'BRONZE',
    ranking_points INT DEFAULT 0,
    winning_streak INT DEFAULT 0,
    
    -- TeamStats (Embedded)
    total_matches INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_scored INT DEFAULT 0,
    goals_conceded INT DEFAULT 0,
    
    win_rate DOUBLE DEFAULT 0.0,
    fair_play_score INT DEFAULT 100,
    
    -- ActiveRegion (Embedded)
    active_region_district VARCHAR(100),
    active_region_city VARCHAR(100),
    
    looking_for_match BOOLEAN DEFAULT FALSE,
    team_description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason VARCHAR(500),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team Members (ElementCollection)
CREATE TABLE team_members (
    team_id BIGINT NOT NULL,
    user_id BIGINT,
    role VARCHAR(50) DEFAULT 'MEMBER',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_team (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team Preferred Play Times (ElementCollection)
CREATE TABLE team_preferred_play_times (
    team_id BIGINT NOT NULL,
    play_time VARCHAR(100),
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team Achievements (ElementCollection)
CREATE TABLE team_achievements (
    team_id BIGINT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    icon_url VARCHAR(500),
    earned_at DATETIME,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venues Table
CREATE TABLE venues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id BIGINT,
    description TEXT,
    
    -- Location (Embedded)
    longitude DOUBLE,
    latitude DOUBLE,
    address VARCHAR(500),
    district VARCHAR(100),
    city VARCHAR(100),
    
    -- Pricing (Embedded)
    prime_time DOUBLE,
    normal_time DOUBLE,
    weekend_rate DOUBLE,
    
    -- Amenities (Embedded)
    parking BOOLEAN DEFAULT FALSE,
    showers BOOLEAN DEFAULT FALSE,
    changing_rooms BOOLEAN DEFAULT FALSE,
    wifi BOOLEAN DEFAULT FALSE,
    drinks BOOLEAN DEFAULT FALSE,
    equipment_rental BOOLEAN DEFAULT FALSE,
    lighting BOOLEAN DEFAULT TRUE,
    
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_verified BOOLEAN DEFAULT FALSE,
    total_reviews INT DEFAULT 0,
    average_rating DOUBLE DEFAULT 5.0,
    total_bookings INT DEFAULT 0,
    qr_code_url VARCHAR(500),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venue Fields (ElementCollection)
CREATE TABLE venue_fields (
    venue_id BIGINT NOT NULL,
    name VARCHAR(255),
    type VARCHAR(50),
    surface_type VARCHAR(50) DEFAULT 'ARTIFICIAL_GRASS',
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venue Images (ElementCollection)
CREATE TABLE venue_images (
    venue_id BIGINT NOT NULL,
    url VARCHAR(500),
    caption VARCHAR(255),
    
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venue Videos (ElementCollection)
CREATE TABLE venue_videos (
    venue_id BIGINT NOT NULL,
    url VARCHAR(500),
    caption VARCHAR(255),
    
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venue Operating Hours (ElementCollection)
CREATE TABLE venue_operating_hours (
    venue_id BIGINT NOT NULL,
    day_of_week VARCHAR(20),
    open_time TIME,
    close_time TIME,
    
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Venue Popular Times (ElementCollection)
CREATE TABLE venue_popular_times (
    venue_id BIGINT NOT NULL,
    time VARCHAR(100),
    
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    venue_id BIGINT,
    field_name VARCHAR(255),
    field_type VARCHAR(50),
    booked_by_id BIGINT,
    team_id BIGINT,
    
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    
    total_price DOUBLE,
    deposit DOUBLE,
    remaining_amount DOUBLE,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_intent_id VARCHAR(255),
    
    qr_code VARCHAR(500),
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at DATETIME,
    
    cancellation_reason TEXT,
    cancelled_at DATETIME,
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (booked_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Bill Splits (ElementCollection)
CREATE TABLE booking_bill_splits (
    booking_id BIGINT NOT NULL,
    user_id BIGINT,
    amount DOUBLE,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    paid_at DATETIME,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Matches Table
CREATE TABLE matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    home_team_id BIGINT,
    away_team_id BIGINT,
    venue_id BIGINT,
    field_name VARCHAR(255),
    booking_id BIGINT,
    
    scheduled_time DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    
    -- MatchResult (Embedded)
    home_score INT,
    away_score INT,
    result_status VARCHAR(50) DEFAULT 'PENDING',
    completed_at DATETIME,
    home_points_gained INT,
    away_points_gained INT,
    
    is_ranked BOOLEAN DEFAULT TRUE,
    video_highlight_url VARCHAR(500),
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_scheduled_time (scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id BIGINT,
    review_type VARCHAR(50) DEFAULT 'VENUE',
    
    venue_id BIGINT,
    team_id BIGINT,
    user_id BIGINT,
    booking_id BIGINT,
    
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    
    -- ReviewCriteria (Embedded)
    facilities INT,
    cleanliness INT,
    service INT,
    value INT,
    
    is_verified BOOLEAN DEFAULT FALSE,
    response TEXT,
    responded_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_review_type (review_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports Table
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT,
    report_type VARCHAR(50) DEFAULT 'USER',
    
    reported_user_id BIGINT,
    reported_team_id BIGINT,
    reported_venue_id BIGINT,
    
    reason VARCHAR(50) DEFAULT 'OTHER',
    description TEXT,
    evidence VARCHAR(500),
    
    status VARCHAR(50) DEFAULT 'PENDING',
    reviewed_by_id BIGINT,
    review_notes TEXT,
    action VARCHAR(255),
    reviewed_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Matchmaking Table
CREATE TABLE matchmaking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT,
    
    preferred_district VARCHAR(100),
    preferred_city VARCHAR(100),
    preferred_field_type VARCHAR(50),
    
    status VARCHAR(50) DEFAULT 'ACTIVE',
    min_ranking_points INT,
    max_ranking_points INT,
    max_distance DOUBLE,
    
    preferred_date DATETIME,
    matched_team_id BIGINT,
    matched_at DATETIME,
    expires_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Matchmaking Preferred Play Times (ElementCollection)
CREATE TABLE matchmaking_preferred_play_times (
    matchmaking_id BIGINT NOT NULL,
    play_time VARCHAR(100),
    
    FOREIGN KEY (matchmaking_id) REFERENCES matchmaking(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Admin User
INSERT INTO users (name, email, password, role, is_verified) 
VALUES ('Admin', 'admin@footballconnect.com', '$2a$10$default', 'ADMIN', TRUE);
