-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: football_connect
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_bill_splits`
--

DROP TABLE IF EXISTS `booking_bill_splits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_bill_splits` (
  `booking_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `payment_status` enum('PENDING','PARTIAL','PAID','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `booking_bill_splits_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_bill_splits`
--

LOCK TABLES `booking_bill_splits` WRITE;
/*!40000 ALTER TABLE `booking_bill_splits` DISABLE KEYS */;
INSERT INTO `booking_bill_splits` VALUES (1,3,120000,'PAID','2026-04-01 11:10:00'),(1,4,120000,'PARTIAL',NULL),(2,4,260000,'PAID','2026-04-02 12:10:00'),(2,5,260000,'PAID','2026-04-02 12:12:00'),(3,5,215000,'PENDING',NULL),(3,3,215000,'PENDING',NULL),(1,3,120000,'PAID','2026-04-01 11:10:00'),(1,4,120000,'PARTIAL',NULL),(2,4,260000,'PAID','2026-04-02 12:10:00'),(2,5,260000,'PAID','2026-04-02 12:12:00'),(3,5,215000,'PENDING',NULL),(3,3,215000,'PENDING',NULL);
/*!40000 ALTER TABLE `booking_bill_splits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `venue_id` bigint DEFAULT NULL,
  `field_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booked_by_id` bigint DEFAULT NULL,
  `team_id` bigint DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_price` double DEFAULT NULL,
  `deposit` double DEFAULT NULL,
  `remaining_amount` double DEFAULT NULL,
  `payment_status` enum('PENDING','PARTIAL','PAID','REFUNDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_intent_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_checked_in` tinyint(1) DEFAULT '0',
  `checked_in_at` datetime DEFAULT NULL,
  `cancellation_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `field_type` enum('ELEVEN_A_SIDE','FIVE_A_SIDE','SEVEN_A_SIDE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `venue_id` (`venue_id`),
  KEY `booked_by_id` (`booked_by_id`),
  KEY `team_id` (`team_id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`booked_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,'Field A',3,1,'2026-04-05 18:00:00','2026-04-05 19:30:00','CONFIRMED',480000,240000,240000,'PARTIAL','pi_football_001','QR-BOOKING-001',0,NULL,NULL,NULL,'Friendly match booking for team practice.','2026-04-01 11:00:00','2026-04-01 11:00:00',NULL),(2,1,'Field B',4,2,'2026-04-06 19:00:00','2026-04-06 20:30:00','COMPLETED',520000,520000,0,'PAID','pi_football_002','QR-BOOKING-002',1,'2026-04-06 18:50:00',NULL,NULL,'Completed evening league match.','2026-04-02 12:00:00','2026-04-02 12:00:00',NULL),(3,2,'Main Pitch',5,3,'2026-04-07 17:30:00','2026-04-07 19:00:00','PENDING',430000,0,430000,'PENDING',NULL,'QR-BOOKING-003',0,NULL,NULL,NULL,'Pending booking awaiting confirmation.','2026-04-03 13:00:00','2026-04-03 13:00:00',NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `home_team_id` bigint DEFAULT NULL,
  `away_team_id` bigint DEFAULT NULL,
  `venue_id` bigint DEFAULT NULL,
  `field_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `scheduled_time` datetime NOT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','DISPUTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `home_score` int DEFAULT NULL,
  `away_score` int DEFAULT NULL,
  `result_status` enum('PENDING','CONFIRMED','DISPUTED','RESOLVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `home_points_gained` int DEFAULT NULL,
  `away_points_gained` int DEFAULT NULL,
  `is_ranked` tinyint(1) DEFAULT '1',
  `video_highlight_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `home_team_id` (`home_team_id`),
  KEY `away_team_id` (`away_team_id`),
  KEY `venue_id` (`venue_id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled_time` (`scheduled_time`),
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE SET NULL,
  CONSTRAINT `matches_ibfk_4` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` VALUES (1,1,2,1,'Field A',1,'2026-04-05 18:00:00','SCHEDULED',NULL,NULL,'PENDING',NULL,NULL,NULL,1,NULL,'Upcoming featured match.','2026-04-01 14:00:00','2026-04-01 14:00:00'),(2,2,3,2,'Main Pitch',2,'2026-04-06 19:00:00','COMPLETED',3,2,'CONFIRMED','2026-04-06 20:40:00',12,8,1,'https://res.cloudinary.com/default-match-highlight.mp4','Close and competitive match.','2026-04-02 15:00:00','2026-04-02 15:00:00');
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matchmaking`
--

DROP TABLE IF EXISTS `matchmaking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matchmaking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `team_id` bigint DEFAULT NULL,
  `preferred_district` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_field_type` enum('FIVE_A_SIDE','SEVEN_A_SIDE','ELEVEN_A_SIDE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ACTIVE','MATCHED','EXPIRED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_ranking_points` int DEFAULT NULL,
  `max_ranking_points` int DEFAULT NULL,
  `max_distance` double DEFAULT NULL,
  `preferred_date` datetime DEFAULT NULL,
  `matched_team_id` bigint DEFAULT NULL,
  `matched_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `matched_team_id` (`matched_team_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `matchmaking_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `matchmaking_ibfk_2` FOREIGN KEY (`matched_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matchmaking`
--

LOCK TABLES `matchmaking` WRITE;
/*!40000 ALTER TABLE `matchmaking` DISABLE KEYS */;
INSERT INTO `matchmaking` VALUES (1,1,'District 1','Ho Chi Minh City','FIVE_A_SIDE','MATCHED',1000,1400,8.5,'2026-04-08 18:00:00',2,'2026-04-03 14:00:00','2026-04-10 18:00:00','2026-04-03 13:30:00'),(2,3,'Binh Thanh','Ho Chi Minh City','SEVEN_A_SIDE','ACTIVE',900,1200,10,'2026-04-09 19:00:00',NULL,NULL,'2026-04-12 19:00:00','2026-04-03 13:45:00');
/*!40000 ALTER TABLE `matchmaking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matchmaking_preferred_play_times`
--

DROP TABLE IF EXISTS `matchmaking_preferred_play_times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matchmaking_preferred_play_times` (
  `matchmaking_id` bigint NOT NULL,
  `play_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `matchmaking_id` (`matchmaking_id`),
  CONSTRAINT `matchmaking_preferred_play_times_ibfk_1` FOREIGN KEY (`matchmaking_id`) REFERENCES `matchmaking` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matchmaking_preferred_play_times`
--

LOCK TABLES `matchmaking_preferred_play_times` WRITE;
/*!40000 ALTER TABLE `matchmaking_preferred_play_times` DISABLE KEYS */;
INSERT INTO `matchmaking_preferred_play_times` VALUES (1,'Sat 18:00-20:00'),(1,'Sun 07:00-10:00'),(2,'Fri 19:00-21:00'),(2,'Sun 08:00-11:00');
/*!40000 ALTER TABLE `matchmaking_preferred_play_times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reporter_id` bigint DEFAULT NULL,
  `report_type` enum('USER','TEAM','VENUE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reported_user_id` bigint DEFAULT NULL,
  `reported_team_id` bigint DEFAULT NULL,
  `reported_venue_id` bigint DEFAULT NULL,
  `reason` enum('FAKE_PROFILE','INAPPROPRIATE_BEHAVIOR','NO_SHOW','CHEATING','HARASSMENT','FALSE_INFORMATION','POOR_FACILITY','SCAM','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evidence` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','UNDER_REVIEW','RESOLVED','DISMISSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by_id` bigint DEFAULT NULL,
  `review_notes` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reporter_id` (`reporter_id`),
  KEY `reported_user_id` (`reported_user_id`),
  KEY `reported_team_id` (`reported_team_id`),
  KEY `reported_venue_id` (`reported_venue_id`),
  KEY `reviewed_by_id` (`reviewed_by_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`reported_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_4` FOREIGN KEY (`reported_venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_5` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,3,'USER',5,NULL,NULL,'FAKE_PROFILE','Suspected fake profile used for repeated signups.','https://res.cloudinary.com/evidence-1.png','UNDER_REVIEW',1,'Need to verify the account details.','Pending verification call','2026-04-03 11:00:00','2026-04-03 10:00:00','2026-04-03 10:05:00'),(2,4,'TEAM',NULL,2,NULL,'CHEATING','Opponents allegedly fielded an ineligible player.','https://res.cloudinary.com/evidence-2.png','RESOLVED',1,'Reviewed match footage and roster.','Warning issued','2026-04-03 11:30:00','2026-04-03 10:20:00','2026-04-03 10:25:00'),(3,5,'VENUE',NULL,NULL,2,'POOR_FACILITY','One field had low lighting during late hours.','https://res.cloudinary.com/evidence-3.png','DISMISSED',2,'Issue was temporary maintenance.','No action','2026-04-03 12:00:00','2026-04-03 10:40:00','2026-04-03 10:45:00'),(4,2,'USER',4,NULL,NULL,'NO_SHOW','Booked and did not arrive on time twice.',NULL,'PENDING',NULL,NULL,NULL,NULL,'2026-04-03 11:00:00','2026-04-03 11:00:00');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reviewer_id` bigint DEFAULT NULL,
  `review_type` enum('VENUE','TEAM','USER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `venue_id` bigint DEFAULT NULL,
  `team_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facilities` int DEFAULT NULL,
  `cleanliness` int DEFAULT NULL,
  `service` int DEFAULT NULL,
  `value` int DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `response` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responded_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `venue_id` (`venue_id`),
  KEY `team_id` (`team_id`),
  KEY `user_id` (`user_id`),
  KEY `booking_id` (`booking_id`),
  KEY `idx_review_type` (`review_type`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_5` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,3,'VENUE',1,NULL,NULL,2,5,'Excellent turf and lighting, very easy to find.',5,5,5,4,1,'Thanks for the great feedback.','2026-04-02 09:00:00','2026-04-02 08:30:00'),(2,4,'TEAM',NULL,1,NULL,1,4,'Strong attacking team and fair play.',NULL,NULL,NULL,NULL,1,NULL,NULL,'2026-04-02 09:30:00'),(3,5,'USER',NULL,NULL,3,2,5,'Great teammate and very punctual.',NULL,NULL,NULL,NULL,1,'Appreciate the kind words.','2026-04-03 10:00:00','2026-04-03 09:45:00'),(4,2,'VENUE',2,NULL,NULL,3,4,'Parking is good and the field is well maintained.',4,4,4,4,1,NULL,NULL,'2026-04-03 10:30:00');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_achievements`
--

DROP TABLE IF EXISTS `team_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_achievements` (
  `team_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `earned_at` datetime DEFAULT NULL,
  KEY `team_id` (`team_id`),
  CONSTRAINT `team_achievements_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_achievements`
--

LOCK TABLES `team_achievements` WRITE;
/*!40000 ALTER TABLE `team_achievements` DISABLE KEYS */;
INSERT INTO `team_achievements` VALUES (1,'City Cup Finalist','Reached the final of the Ho Chi Minh City amateur cup.','https://res.cloudinary.com/default-team-achievement.png','2026-03-28 18:00:00'),(1,'Five Match Win Streak','Won five consecutive matches without a loss.','https://res.cloudinary.com/default-team-achievement.png','2026-03-29 18:00:00'),(2,'Best Defense Month','Conceded the fewest goals in the district league.','https://res.cloudinary.com/default-team-achievement.png','2026-03-30 18:00:00'),(3,'Rising Team','Promoted to regular weekly matchmaking.','https://res.cloudinary.com/default-team-achievement.png','2026-04-01 18:00:00');
/*!40000 ALTER TABLE `team_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `team_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `role` enum('CAPTAIN','MEMBER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_team` (`team_id`),
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,3,'CAPTAIN','2026-03-20 18:00:00'),(1,4,'MEMBER','2026-03-20 18:10:00'),(1,5,'MEMBER','2026-03-20 18:20:00'),(2,4,'CAPTAIN','2026-03-22 19:00:00'),(2,3,'MEMBER','2026-03-22 19:05:00'),(2,5,'MEMBER','2026-03-22 19:10:00'),(3,5,'CAPTAIN','2026-03-25 20:00:00'),(3,3,'MEMBER','2026-03-25 20:05:00'),(3,4,'MEMBER','2026-03-25 20:10:00');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_preferred_play_times`
--

DROP TABLE IF EXISTS `team_preferred_play_times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_preferred_play_times` (
  `team_id` bigint NOT NULL,
  `play_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `team_id` (`team_id`),
  CONSTRAINT `team_preferred_play_times_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_preferred_play_times`
--

LOCK TABLES `team_preferred_play_times` WRITE;
/*!40000 ALTER TABLE `team_preferred_play_times` DISABLE KEYS */;
INSERT INTO `team_preferred_play_times` VALUES (1,'Mon 18:00-20:00'),(1,'Wed 18:00-20:00'),(1,'Sat 07:00-10:00'),(2,'Tue 19:00-21:00'),(2,'Thu 19:00-21:00'),(3,'Fri 18:30-20:30'),(3,'Sun 08:00-11:00');
/*!40000 ALTER TABLE `team_preferred_play_times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `captain_id` bigint DEFAULT NULL,
  `tier` enum('BRONZE','SILVER','GOLD','PLATINUM','DIAMOND') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ranking_points` int DEFAULT '0',
  `winning_streak` int DEFAULT '0',
  `total_matches` int DEFAULT '0',
  `wins` int DEFAULT '0',
  `draws` int DEFAULT '0',
  `losses` int DEFAULT '0',
  `goals_scored` int DEFAULT '0',
  `goals_conceded` int DEFAULT '0',
  `win_rate` double DEFAULT '0',
  `fair_play_score` int DEFAULT '100',
  `active_region_district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active_region_city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `looking_for_match` tinyint(1) DEFAULT '0',
  `team_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_banned` tinyint(1) DEFAULT '0',
  `ban_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `captain_id` (`captain_id`),
  KEY `idx_name` (`name`),
  KEY `idx_tier` (`tier`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Saigon Strikers','https://res.cloudinary.com/default-team-logo.png',3,'GOLD',1280,4,24,15,4,5,58,32,62.5,97,'Go Vap','Ho Chi Minh City',1,'Fast attacking amateur team from the north of the city.',1,0,NULL,'2026-04-01 09:00:00','2026-04-01 09:00:00',NULL,NULL),(2,'District 1 United','https://res.cloudinary.com/default-team-logo.png',4,'SILVER',1140,2,20,11,5,4,41,29,55,95,'District 1','Ho Chi Minh City',1,'Balanced team with strong midfield control and weekly matches.',1,0,NULL,'2026-04-01 09:05:00','2026-04-01 09:05:00',NULL,NULL),(3,'Binh Thanh Warriors','https://res.cloudinary.com/default-team-logo.png',5,'BRONZE',980,1,16,8,3,5,33,26,50,92,'Binh Thanh','Ho Chi Minh City',0,'Growing team focused on training and friendly competition.',1,0,NULL,'2026-04-01 09:10:00','2026-04-01 09:10:00',NULL,NULL);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('USER','VENUE_OWNER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_position` enum('GK','DF','MF','FW','ANY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skill_level` enum('BEGINNER','INTERMEDIATE','ADVANCED','PRO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_banned` tinyint(1) DEFAULT '0',
  `ban_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fair_play_score` int DEFAULT '100',
  `total_reviews` int DEFAULT '0',
  `average_rating` double DEFAULT '5',
  `reset_password_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_expire` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@footballconnect.com','0901000001','$2a$10$HlSB/ET522E2Ahx9Mkaie.SZ95N2byk1AbRn2fAalsx0dAfeTNaXS','ADMIN','https://res.cloudinary.com/default-avatar.png',106.7009,10.7769,'District 1, Ho Chi Minh City','District 1','Ho Chi Minh City','ANY','ADVANCED',1,0,NULL,100,12,4.9,NULL,NULL,'2026-04-01 08:00:00','2026-04-05 15:14:04'),(2,'Nguyen Van Owner','owner@footballconnect.com','0901000002','$2a$10$7aK6GQKJ8JY9jY8JvQXv3e4tD0Z8d7g4mC7sWkQqf9lQ8u4d2xNq2','VENUE_OWNER','https://res.cloudinary.com/default-avatar.png',106.682,10.8,'Tan Binh District, Ho Chi Minh City','Tan Binh','Ho Chi Minh City','ANY','INTERMEDIATE',1,0,NULL,100,4,4.8,NULL,NULL,'2026-04-01 08:10:00','2026-04-01 08:10:00'),(3,'Tran Minh Khoa','khoa@footballconnect.com','0901000003','$2a$10$7aK6GQKJ8JY9jY8JvQXv3e4tD0Z8d7g4mC7sWkQqf9lQ8u4d2xNq2','USER','https://res.cloudinary.com/default-avatar.png',106.68,10.79,'Go Vap District, Ho Chi Minh City','Go Vap','Ho Chi Minh City','MF','ADVANCED',1,0,NULL,96,8,4.7,NULL,NULL,'2026-04-01 08:20:00','2026-04-01 08:20:00'),(4,'Le Hoang Nam','nam@footballconnect.com','0901000004','$2a$10$7aK6GQKJ8JY9jY8JvQXv3e4tD0Z8d7g4mC7sWkQqf9lQ8u4d2xNq2','USER','https://res.cloudinary.com/default-avatar.png',106.72,10.81,'Phu Nhuan District, Ho Chi Minh City','Phu Nhuan','Ho Chi Minh City','FW','INTERMEDIATE',1,0,NULL,94,6,4.6,NULL,NULL,'2026-04-01 08:25:00','2026-04-01 08:25:00'),(5,'Pham Quoc Huy','huy@footballconnect.com','0901000005','$2a$10$7aK6GQKJ8JY9jY8JvQXv3e4tD0Z8d7g4mC7sWkQqf9lQ8u4d2xNq2','USER','https://res.cloudinary.com/default-avatar.png',106.66,10.84,'Binh Thanh District, Ho Chi Minh City','Binh Thanh','Ho Chi Minh City','DF','BEGINNER',1,0,NULL,91,2,4.3,NULL,NULL,'2026-04-01 08:30:00','2026-04-01 08:30:00'),(6,'Nguyen Dang Vinh','vzn3114@gmail.com','0949982759','$2a$10$suawbTOPbJ/qbnVhH4q/hujGWR6lFzeXgqFLzb.Q9kgo/NG4txntC','USER','https://res.cloudinary.com/default-avatar.png',NULL,NULL,NULL,NULL,NULL,'ANY','INTERMEDIATE',0,0,NULL,100,0,5,NULL,NULL,'2026-04-14 15:25:44','2026-04-14 15:25:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venue_fields`
--

DROP TABLE IF EXISTS `venue_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue_fields` (
  `venue_id` bigint NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('FIVE_A_SIDE','SEVEN_A_SIDE','ELEVEN_A_SIDE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surface_type` enum('NATURAL_GRASS','ARTIFICIAL_GRASS','HARD_COURT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('AVAILABLE','MAINTENANCE','CLOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `venue_fields_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venue_fields`
--

LOCK TABLES `venue_fields` WRITE;
/*!40000 ALTER TABLE `venue_fields` DISABLE KEYS */;
INSERT INTO `venue_fields` VALUES (1,'Field A','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(1,'Field B','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(2,'Main Pitch','ELEVEN_A_SIDE','NATURAL_GRASS','AVAILABLE'),(2,'Training Pitch','FIVE_A_SIDE','ARTIFICIAL_GRASS','MAINTENANCE'),(3,'Sân bóng đá Phạm Hùng - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(4,'Sân Bóng Mini Khu Phố 7 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(5,'Sân bóng TAO ĐÀN - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(6,'Sân bóng đá mini Thành Thái - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(7,'Sân cỏ nhân tạo Tiểu Ngư - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(8,'Sân bóng THỐNG NHẤT - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(9,'Sân bóng đá Kỳ Hòa - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(10,'Sân bóng MobiSports - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(11,'Sân bóng PHÚ THỌ - San chinh','ELEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(12,'Sân bóng THÀNH PHÁT-CÔNG TY XDTT THÀNH PHÁT - San chinh','ELEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(13,'sân bóng đá cỏ nhân tạo cầu suối - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(14,'Sân Bóng Hồ Bơi Trung Đoàn Gia Định - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(15,'Sân bóng SSA Quận 2 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(16,'Sân bóng đá mini cỏ nhân tạo Đường Tô Ký - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(17,'Sân bóng Anh Tú Đường Trung Mỹ Tây 2A - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(18,'Sân bóng Minh Trí Đường Đông Hưng Thuận 11 - San chinh','ELEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(19,'Sân bóng mini Hữu Nghị Đường An Phú Đông 9 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(20,'Sân bóng đá cỏ nhân tạo trường cao đẳng GTVT Đường Nguyễn Ảnh Thủ - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(21,'Sân cỏ nhân tạo Thùy Linh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(22,'Sân bóng đá mini cỏ nhân tạo Lan Anh - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(23,'Sân Bóng Đá Mini Quang Trung - Tân Chánh Hiệp 35 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(24,'Sân cỏ nhân tạo THANH PHAT - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(25,'Sân bóng Mai Vàng - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(26,'Sân bóng đá Cây Sộp - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(27,'Sân bóng đá Nguyễn Gia - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(28,'Sân bóng đá Lam Sơn Q5 - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(29,'Sân Bóng Đá Mini Đức Tân - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(30,'Sân bóng THÉP MIỀN NAM CẢNG SÀI GÒN - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(31,'Sân bóng Hoàng Kim - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(32,'Sân bóng đá Cao Lỗ - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(33,'Sân bóng Long Trường - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(34,'Sân Bóng Cỏ Nhân Tạo Kaly - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(35,'Sân bóng TTTDTT Quận 9 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(36,'Sân bóng Câu Lạc Bộ TDTT Hoàng Phú - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(37,'Sân Bóng Đá Cỏ Nhân Tạo Hoàng Phú - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(38,'Sân bóng đá mini cỏ nhân tạo Phù Đổng - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(39,'Sân bóng đá mini cỏ nhân tạo Trung tâm TDTT Quận 9 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(40,'Sân bóng Hiệp Phú - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(41,'Sân bóng Tiến Phát - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(42,'Sân bóng Lam Sơn - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(43,'Sân bóng Lâm Thịnh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(44,'Sân bóng Hoàng Thịnh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(45,'SÂN bóng THÀNH PHÁT-CÔNG TY XDTT THÀNH PHÁT - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(46,'Sân bóng đá Đại Châu - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(47,'Sân bóng mini Hải Long - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(48,'Sân Bóng Đá Số 3 KCN Tân Tạo - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(49,'Sân Bóng Chế Lan Viên - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(50,'Sân Bóng Lê Thành - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(51,'Sân bóng đá mini - Cafe sân vườn Marina - San chinh','ELEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(52,'Sân bóng Hồng Bàng Marina Dien Bien Phu - San chinh','ELEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(53,'Sân Bóng Đá Mini Victory - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(54,'SÂN BÓNG ĐÁ MINI SỐ 4 CHU VĂN AN - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(55,'Sân bóng đá mini Hoa Lư - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(56,'Sân Bóng MiNi Thiên Trường - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(57,'Sân cỏ nhân tạo Thanh Đa - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(58,'Sân cỏ nhân tạo Chu Văn An - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(59,'Sân cỏ nhân tạo Phương Nam - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(60,'Sân bóng đá mini cỏ nhân tạo Thái - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(61,'Cụm sân cỏ nhân tạo D3 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(62,'Sân Bóng Đá Cỏ Nhân Tạo Ngôi Sao - HCA - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(63,'Sân bóng Chu Văn An - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(64,'Sân bóng THANH PHAT - CÔNG TY XD THỂ THAO THANH PHAT - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(65,'Sân bóng Thái 343/26 Nơ Trang Long - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(66,'Sân bóng đá D3 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(67,'Sân bóng đá Quyết Tâm 2 - San chinh','ELEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(68,'CLB Bóng Đá Mini Nhân Tạo Đại Nam - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(69,'Sân cỏ nhân tạo Thống Nhất - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(70,'Sân bóng đá mini QUANG TRUNG - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(71,'Sân cỏ nhân tạo Phương Nam 2 - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(72,'Sân bóng QUANG TUYẾN 3 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(73,'Sân bóng QUANG TUYẾN 1 VÀ 2 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(74,'Sân bóng Thành Lâm - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(75,'Sân bóng Minh Tiến - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(76,'Sân cỏ nhân tạo Minh Tiến - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(77,'Sân bóng Cây Trâm - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(78,'Sân bóng Hải Sơn - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(79,'Sân bóng Bình An - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(80,'Sân bóng An Hội - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(81,'Sân bóng CLB Bóng Đá Phương Đô - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(82,'Sân bóng 230 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(83,'Sân bóng 123 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(84,'Sân bóng đá 77 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(85,'Sân bóng Đạt Đức - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(86,'Sân Kingsport 36 Hoa Sữa - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(87,'Sân Bóng Quyết Tâm - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(88,'Sân bóng Đào Duy Anh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(89,'Sân bóng PHÚ NHUẬN - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(90,'Sân bóng mini 20 Cộng Hoà - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(91,'Sân Bóng Đá TRUNG TÂM MIỀN NAM - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(92,'Trung Tâm Tổ Hợp Sân Bóng Cỏ Tự Nhiên tân sơn -917 - 370 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(93,'Sân Bóng Đá Mini Phúc Yên - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(94,'Sân cỏ nhân tạo Huỳnh Tấn – Cộng Hòa - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(95,'Sân cỏ nhân tạo Khu Thể Thao K2 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(96,'Sân bóng CLB 367 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(97,'Sân bóng tạo A41 – Cộng Hòa - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(98,'Sân bóng D36 – Hoàng Hoa Thám - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(99,'Sân bóng đá Chảo Lửa - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(100,'Sân bóng HUẤN LUYỆN BAY - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(101,'Sân bóng QUỐC PHÒNG 2 - QUÂN KHU 7 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(102,'Sân bóng TRUNG TÂM THỂ THAO A 2 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(103,'Sân bóng đá Thăng Long - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(104,'Sân bóng đá Hoàng Gia - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(105,'Sân bóng Bảo Anh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(106,'Sân bóng đá K334 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(107,'Sân bóng đá K2 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(108,'Sân Bóng Đá Tân Thới Hòa - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(109,'Sân bóng đá phường Tân Sơn Nhì - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(110,'Sân Bóng Đá Mini Lâm Thịnh C1 - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(111,'Sân bóng đá mi ni Lê Lợi - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(112,'Sân Bóng Tuổi Thơ - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(113,'Sân cỏ nhân tạo Phương Đô - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(114,'Sân Bóng Đá Celadon City - Tân Phú - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(115,'Cụm sân bóng đá mini Sport Plus - San chinh','FIVE_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(116,'Sân bóng đá mini Gia Nguyễn - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(117,'Sân bóng Hoà Thạnh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(118,'Sân bóng Phường Tây Thạnh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(119,'Sân bóng Hiệp Tân - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(120,'Sân bóng PHƯỜNG TÂY THẠNH - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(121,'Sân bóng TÂN THẮNG - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(122,'Sân bóng Hòa Thạnh - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(123,'Sân Bóng Đá Mini Linh Xuân Thủ Đức - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(124,'Sân bóng AT Thủ Đức - San chinh','ELEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(125,'Cụm sân bóng ĐH Nông Lâm - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(126,'Sân bóng đá mini Ti Gôn - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(127,'Sân Bóng Cá Sấu Hoa Cà - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(128,'Sân Bóng Đá Linh Đông - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(129,'Sân Bóng đá mini Việt Thắng - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(130,'Sân bóng HoSaNa - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE'),(131,'Sân bóng Nhà Thiếu Nhi Quận Thủ Đức - San chinh','SEVEN_A_SIDE','ARTIFICIAL_GRASS','AVAILABLE');
/*!40000 ALTER TABLE `venue_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venue_images`
--

DROP TABLE IF EXISTS `venue_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue_images` (
  `venue_id` bigint NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `venue_images_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venue_images`
--

LOCK TABLES `venue_images` WRITE;
/*!40000 ALTER TABLE `venue_images` DISABLE KEYS */;
INSERT INTO `venue_images` VALUES (1,'https://res.cloudinary.com/default-venue-1.jpg','Panoramic view of Saigon Arena 1'),(1,'https://res.cloudinary.com/default-venue-2.jpg','Field A at night'),(2,'https://res.cloudinary.com/default-venue-3.jpg','Tan Binh Sports Park main entrance'),(2,'https://res.cloudinary.com/default-venue-4.jpg','Floodlit training pitch'),(3,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Ph%E1%BA%A1m%20H%C3%B9ng%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(4,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20Mini%20Khu%20Ph%E1%BB%91%207%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(5,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20TAO%20%C4%90%C3%80N%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(6,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20Th%C3%A0nh%20Th%C3%A1i%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(7,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Ti%E1%BB%83u%20Ng%C6%B0%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(8,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20TH%E1%BB%90NG%20NH%E1%BA%A4T%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(9,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20K%E1%BB%B3%20H%C3%B2a%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(10,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20MobiSports%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(11,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20PH%C3%9A%20TH%E1%BB%8C%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(12,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20TH%C3%80NH%20PH%C3%81T-C%C3%94NG%20TY%20XDTT%20TH%C3%80NH%20PH%C3%81T%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(13,'https://source.unsplash.com/1600x900/?football%20field,s%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20c%E1%BA%A7u%20su%E1%BB%91i%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(14,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20H%E1%BB%93%20B%C6%A1i%20Trung%20%C4%90o%C3%A0n%20Gia%20%C4%90%E1%BB%8Bnh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(15,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20SSA%20Qu%E1%BA%ADn%202%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(16,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20%C4%90%C6%B0%E1%BB%9Dng%20T%C3%B4%20K%C3%BD%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(17,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Anh%20T%C3%BA%20%C4%90%C6%B0%E1%BB%9Dng%20Trung%20M%E1%BB%B9%20T%C3%A2y%202A%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(18,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Minh%20Tr%C3%AD%20%C4%90%C6%B0%E1%BB%9Dng%20%C4%90%C3%B4ng%20H%C6%B0ng%20Thu%E1%BA%ADn%2011%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(19,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20mini%20H%E1%BB%AFu%20Ngh%E1%BB%8B%20%C4%90%C6%B0%E1%BB%9Dng%20An%20Ph%C3%BA%20%C4%90%C3%B4ng%209%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(21,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Th%C3%B9y%20Linh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(22,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Lan%20Anh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(23,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20Mini%20Quang%20Trung%20-%20T%C3%A2n%20Ch%C3%A1nh%20Hi%E1%BB%87p%2035%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(24,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20THANH%20PHAT%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(25,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Mai%20V%C3%A0ng%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(26,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20C%C3%A2y%20S%E1%BB%99p%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(27,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Nguy%E1%BB%85n%20Gia%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(28,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Lam%20S%C6%A1n%20Q5%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(29,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20Mini%20%C4%90%E1%BB%A9c%20T%C3%A2n%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(30,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20TH%C3%89P%20MI%E1%BB%80N%20NAM%20C%E1%BA%A2NG%20S%C3%80I%20G%C3%92N%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(31,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Ho%C3%A0ng%20Kim%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(32,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Cao%20L%E1%BB%97%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(33,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Long%20Tr%C6%B0%E1%BB%9Dng%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(34,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20C%E1%BB%8F%20Nh%C3%A2n%20T%E1%BA%A1o%20Kaly%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(35,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20TTTDTT%20Qu%E1%BA%ADn%209%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(36,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20C%C3%A2u%20L%E1%BA%A1c%20B%E1%BB%99%20TDTT%20Ho%C3%A0ng%20Ph%C3%BA%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(37,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20C%E1%BB%8F%20Nh%C3%A2n%20T%E1%BA%A1o%20Ho%C3%A0ng%20Ph%C3%BA%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(38,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Ph%C3%B9%20%C4%90%E1%BB%95ng%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(39,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Trung%20t%C3%A2m%20TDTT%20Qu%E1%BA%ADn%209%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(40,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Hi%E1%BB%87p%20Ph%C3%BA%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(41,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Ti%E1%BA%BFn%20Ph%C3%A1t%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(42,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Lam%20S%C6%A1n%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(43,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20L%C3%A2m%20Th%E1%BB%8Bnh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(44,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Ho%C3%A0ng%20Th%E1%BB%8Bnh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(45,'https://source.unsplash.com/1600x900/?football%20field,S%C3%82N%20b%C3%B3ng%20TH%C3%80NH%20PH%C3%81T-C%C3%94NG%20TY%20XDTT%20TH%C3%80NH%20PH%C3%81T%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(46,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20%C4%90%E1%BA%A1i%20Ch%C3%A2u%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(47,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20mini%20H%E1%BA%A3i%20Long%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(48,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20S%E1%BB%91%203%20KCN%20T%C3%A2n%20T%E1%BA%A1o%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(49,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20Ch%E1%BA%BF%20Lan%20Vi%C3%AAn%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(50,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20L%C3%AA%20Th%C3%A0nh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(51,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20-%20Cafe%20s%C3%A2n%20v%C6%B0%E1%BB%9Dn%20Marina%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(52,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20H%E1%BB%93ng%20B%C3%A0ng%20Marina%20Dien%20Bien%20Phu%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(53,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20Mini%20Victory%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(54,'https://source.unsplash.com/1600x900/?football%20field,S%C3%82N%20B%C3%93NG%20%C4%90%C3%81%20MINI%20S%E1%BB%90%204%20CHU%20V%C4%82N%20AN%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(55,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20Hoa%20L%C6%B0%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(56,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20MiNi%20Thi%C3%AAn%20Tr%C6%B0%E1%BB%9Dng%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(57,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Thanh%20%C4%90a%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(58,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Chu%20V%C4%83n%20An%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(59,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Ph%C6%B0%C6%A1ng%20Nam%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(60,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Th%C3%A1i%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(61,'https://source.unsplash.com/1600x900/?football%20field,C%E1%BB%A5m%20s%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20D3%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(62,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20C%E1%BB%8F%20Nh%C3%A2n%20T%E1%BA%A1o%20Ng%C3%B4i%20Sao%20-%20HCA%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(63,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Chu%20V%C4%83n%20An%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(64,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20THANH%20PHAT%20-%20C%C3%94NG%20TY%20XD%20TH%E1%BB%82%20THAO%20THANH%20PHAT%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(65,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Th%C3%A1i%20343%2F26%20N%C6%A1%20Trang%20Long%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(66,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20D3%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(67,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Quy%E1%BA%BFt%20T%C3%A2m%202%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(68,'https://source.unsplash.com/1600x900/?football%20field,CLB%20B%C3%B3ng%20%C4%90%C3%A1%20Mini%20Nh%C3%A2n%20T%E1%BA%A1o%20%C4%90%E1%BA%A1i%20Nam%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(69,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Th%E1%BB%91ng%20Nh%E1%BA%A5t%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(70,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20QUANG%20TRUNG%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(71,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Ph%C6%B0%C6%A1ng%20Nam%202%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(72,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20QUANG%20TUY%E1%BA%BEN%203%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(73,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20QUANG%20TUY%E1%BA%BEN%201%20V%C3%80%202%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(74,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Th%C3%A0nh%20L%C3%A2m%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(75,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Minh%20Ti%E1%BA%BFn%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(76,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Minh%20Ti%E1%BA%BFn%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(77,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20C%C3%A2y%20Tr%C3%A2m%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(78,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20H%E1%BA%A3i%20S%C6%A1n%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(79,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20B%C3%ACnh%20An%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(80,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20An%20H%E1%BB%99i%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(81,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20CLB%20B%C3%B3ng%20%C4%90%C3%A1%20Ph%C6%B0%C6%A1ng%20%C4%90%C3%B4%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(82,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20230%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(83,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20123%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(84,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%2077%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(85,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%90%E1%BA%A1t%20%C4%90%E1%BB%A9c%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(86,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20Kingsport%2036%20Hoa%20S%E1%BB%AFa%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(87,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20Quy%E1%BA%BFt%20T%C3%A2m%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(88,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%90%C3%A0o%20Duy%20Anh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(89,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20PH%C3%9A%20NHU%E1%BA%ACN%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(90,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20mini%2020%20C%E1%BB%99ng%20Ho%C3%A0%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(91,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20TRUNG%20T%C3%82M%20MI%E1%BB%80N%20NAM%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(92,'https://source.unsplash.com/1600x900/?football%20field,Trung%20T%C3%A2m%20T%E1%BB%95%20H%E1%BB%A3p%20S%C3%A2n%20B%C3%B3ng%20C%E1%BB%8F%20T%E1%BB%B1%20Nhi%C3%AAn%20t%C3%A2n%20s%C6%A1n%20-917%20-%20370%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(93,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20Mini%20Ph%C3%BAc%20Y%C3%AAn%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(94,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Hu%E1%BB%B3nh%20T%E1%BA%A5n%20%E2%80%93%20C%E1%BB%99ng%20H%C3%B2a%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(95,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Khu%20Th%E1%BB%83%20Thao%20K2%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(96,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20CLB%20367%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(97,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20t%E1%BA%A1o%20A41%20%E2%80%93%20C%E1%BB%99ng%20H%C3%B2a%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(98,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20D36%20%E2%80%93%20Ho%C3%A0ng%20Hoa%20Th%C3%A1m%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(99,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Ch%E1%BA%A3o%20L%E1%BB%ADa%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(100,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20HU%E1%BA%A4N%20LUY%E1%BB%86N%20BAY%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(101,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20QU%E1%BB%90C%20PH%C3%92NG%202%20-%20QU%C3%82N%20KHU%207%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(102,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20TRUNG%20T%C3%82M%20TH%E1%BB%82%20THAO%20A%202%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(103,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Th%C4%83ng%20Long%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(104,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20Ho%C3%A0ng%20Gia%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(105,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20B%E1%BA%A3o%20Anh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(106,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20K334%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(107,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20K2%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(108,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20Bo%CC%81ng%20%C4%90a%CC%81%20T%C3%A2n%20Th%C6%A1%CC%81i%20Ho%CC%80a%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(109,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20ph%C6%B0%E1%BB%9Dng%20T%C3%A2n%20S%C6%A1n%20Nh%C3%AC%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(110,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20Mini%20L%C3%A2m%20Th%E1%BB%8Bnh%20C1%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(111,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mi%20ni%20L%C3%AA%20L%E1%BB%A3i%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(112,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20Tu%E1%BB%95i%20Th%C6%A1%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(113,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20c%E1%BB%8F%20nh%C3%A2n%20t%E1%BA%A1o%20Ph%C6%B0%C6%A1ng%20%C4%90%C3%B4%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(114,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20Bo%CC%81ng%20%C4%90a%CC%81%20Celadon%20City%20-%20T%C3%A2n%20Ph%C3%BA%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(115,'https://source.unsplash.com/1600x900/?football%20field,C%E1%BB%A5m%20s%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20Sport%20Plus%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(116,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20Gia%20Nguy%E1%BB%85n%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(117,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Ho%C3%A0%20Th%E1%BA%A1nh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(118,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Ph%C6%B0%E1%BB%9Dng%20T%C3%A2y%20Th%E1%BA%A1nh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(119,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Hi%E1%BB%87p%20T%C3%A2n%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(120,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20PH%C6%AF%E1%BB%9CNG%20T%C3%82Y%20TH%E1%BA%A0NH%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(121,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20T%C3%82N%20TH%E1%BA%AENG%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(122,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20H%C3%B2a%20Th%E1%BA%A1nh%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(123,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20Mini%20Linh%20Xu%C3%A2n%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(124,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20AT%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(125,'https://source.unsplash.com/1600x900/?football%20field,C%E1%BB%A5m%20s%C3%A2n%20b%C3%B3ng%20%C4%90H%20N%C3%B4ng%20L%C3%A2m%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(126,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20%C4%91%C3%A1%20mini%20Ti%20G%C3%B4n%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(127,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20C%C3%A1%20S%E1%BA%A5u%20Hoa%20C%C3%A0%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(128,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%90%C3%A1%20Linh%20%C4%90%C3%B4ng%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(129,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20B%C3%B3ng%20%C4%91%C3%A1%20mini%20Vi%E1%BB%87t%20Th%E1%BA%AFng%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(130,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20HoSaNa%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(131,'https://source.unsplash.com/1600x900/?football%20field,S%C3%A2n%20b%C3%B3ng%20Nh%C3%A0%20Thi%E1%BA%BFu%20Nhi%20Qu%E1%BA%ADn%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%20H%E1%BB%93%20Ch%C3%AD%20Minh','Anh san tham khao'),(20,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(132,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(133,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(134,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(135,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(136,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(137,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(138,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(139,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(140,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(141,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao'),(142,'https://source.unsplash.com/1600x900/?football%20field,Hồ-Chí-Minh','Anh san tham khao');
/*!40000 ALTER TABLE `venue_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venue_operating_hours`
--

DROP TABLE IF EXISTS `venue_operating_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue_operating_hours` (
  `venue_id` bigint NOT NULL,
  `day_of_week` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `close` time(6) DEFAULT NULL,
  `open` time(6) DEFAULT NULL,
  `operating_hours_key` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `venue_operating_hours_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venue_operating_hours`
--

LOCK TABLES `venue_operating_hours` WRITE;
/*!40000 ALTER TABLE `venue_operating_hours` DISABLE KEYS */;
INSERT INTO `venue_operating_hours` VALUES (1,'MONDAY','06:00:00','23:00:00',NULL,NULL,'MONDAY'),(1,'TUESDAY','06:00:00','23:00:00',NULL,NULL,'MONDAY'),(1,'WEDNESDAY','06:00:00','23:00:00',NULL,NULL,'MONDAY'),(1,'THURSDAY','06:00:00','23:00:00',NULL,NULL,'MONDAY'),(1,'FRIDAY','06:00:00','23:30:00',NULL,NULL,'MONDAY'),(1,'SATURDAY','05:30:00','23:30:00',NULL,NULL,'MONDAY'),(1,'SUNDAY','05:30:00','22:30:00',NULL,NULL,'MONDAY'),(2,'MONDAY','06:00:00','22:30:00',NULL,NULL,'MONDAY'),(2,'TUESDAY','06:00:00','22:30:00',NULL,NULL,'MONDAY'),(2,'WEDNESDAY','06:00:00','22:30:00',NULL,NULL,'MONDAY'),(2,'THURSDAY','06:00:00','22:30:00',NULL,NULL,'MONDAY'),(2,'FRIDAY','06:00:00','23:00:00',NULL,NULL,'MONDAY'),(2,'SATURDAY','05:30:00','23:00:00',NULL,NULL,'MONDAY'),(2,'SUNDAY','05:30:00','22:00:00',NULL,NULL,'MONDAY');
/*!40000 ALTER TABLE `venue_operating_hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venue_popular_times`
--

DROP TABLE IF EXISTS `venue_popular_times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue_popular_times` (
  `venue_id` bigint NOT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `venue_popular_times_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venue_popular_times`
--

LOCK TABLES `venue_popular_times` WRITE;
/*!40000 ALTER TABLE `venue_popular_times` DISABLE KEYS */;
INSERT INTO `venue_popular_times` VALUES (1,'18:00-20:00'),(1,'20:00-22:00'),(2,'17:30-19:30'),(2,'19:30-21:30');
/*!40000 ALTER TABLE `venue_popular_times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venue_videos`
--

DROP TABLE IF EXISTS `venue_videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue_videos` (
  `venue_id` bigint NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `venue_id` (`venue_id`),
  CONSTRAINT `venue_videos_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venue_videos`
--

LOCK TABLES `venue_videos` WRITE;
/*!40000 ALTER TABLE `venue_videos` DISABLE KEYS */;
INSERT INTO `venue_videos` VALUES (1,'https://res.cloudinary.com/default-venue-video-1.mp4','Venue tour'),(2,'https://res.cloudinary.com/default-venue-video-2.mp4','Match day highlight');
/*!40000 ALTER TABLE `venue_videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venues`
--

DROP TABLE IF EXISTS `venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` bigint DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prime_time` double DEFAULT NULL,
  `normal_time` double DEFAULT NULL,
  `weekend_rate` double DEFAULT NULL,
  `parking` tinyint(1) DEFAULT '0',
  `showers` tinyint(1) DEFAULT '0',
  `changing_rooms` tinyint(1) DEFAULT '0',
  `wifi` tinyint(1) DEFAULT '0',
  `drinks` tinyint(1) DEFAULT '0',
  `equipment_rental` tinyint(1) DEFAULT '0',
  `lighting` tinyint(1) DEFAULT '1',
  `status` enum('ACTIVE','INACTIVE','PENDING_VERIFICATION') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `total_reviews` int DEFAULT '0',
  `average_rating` double DEFAULT '5',
  `total_bookings` int DEFAULT '0',
  `qr_code_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `idx_status` (`status`),
  KEY `idx_city` (`city`),
  CONSTRAINT `venues_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venues`
--

LOCK TABLES `venues` WRITE;
/*!40000 ALTER TABLE `venues` DISABLE KEYS */;
INSERT INTO `venues` VALUES (1,'Saigon Arena 1',2,'Modern 5-a-side and 7-a-side venue near central districts.',106.678,10.7905,'12 Nguyen Trai Street','District 1','Ho Chi Minh City',420000,320000,480000,1,1,1,1,1,1,1,'ACTIVE',1,42,4.8,120,'https://res.cloudinary.com/default-qr.png','2026-04-01 10:00:00','2026-04-01 10:00:00'),(2,'Tan Binh Sports Park',2,'Spacious outdoor complex with floodlights and parking.',106.6525,10.802,'88 Hoang Van Thu Street','Tan Binh','Ho Chi Minh City',390000,290000,430000,1,1,1,0,1,1,1,'ACTIVE',1,28,4.6,86,'https://res.cloudinary.com/default-qr.png','2026-04-01 10:10:00','2026-04-01 10:10:00'),(3,'Sân bóng đá Phạm Hùng',NULL,'Nguon: thamconhantao.vn',106.5763,10.696,'c7d Phạm Hùng (Huyện Bình Chánh, Hồ Chí Minh)','Huyện Bình Chánh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(4,'Sân Bóng Mini Khu Phố 7',NULL,'Nguon: thamconhantao.vn',106.6092141,10.7605388,'Sân Bóng Đá Mini Bình Trị, Chiến Lược, Khu phố 8, Phường Bình Trị Đông, Thành phố Hồ Chí Minh, 73118, Việt Nam','Huyện Củ Chi','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:30:18'),(5,'Sân bóng TAO ĐÀN',NULL,'Nguon: thamconhantao.vn',106.7009,10.7769,'1 Huyền Trân Công Chúa p.Bến Thành (Quận 1, Hồ Chí Minh)','Quận 1','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(6,'Sân bóng đá mini Thành Thái',NULL,'Nguon: thamconhantao.vn',106.4564116,11.0248314,'Sân bóng đá mini Trung Lập, Tỉnh lộ 2, Xã Nhuận Đức, Thành phố Hồ Chí Minh, 75500, Việt Nam','Quận 10','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:30:18'),(7,'Sân cỏ nhân tạo Tiểu Ngư',NULL,'Nguon: thamconhantao.vn',106.6679,10.7746,'780A Sư Vạn Hạnh, Phường 12 (Quận 10, Hồ Chí Minh)','Quận 10','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(8,'Sân bóng THỐNG NHẤT',NULL,'Nguon: thamconhantao.vn',106.6679,10.7746,'30 Nguyễn Kim, P.6 (Quận 10, Hồ Chí Minh)','Quận 10','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(9,'Sân bóng đá Kỳ Hòa',NULL,'Nguon: thamconhantao.vn',106.6679,10.7746,'824/28Q Sư Vạn Hạnh, Phường 12 (Quận 10, Hồ Chí Minh)','Quận 10','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(10,'Sân bóng MobiSports',NULL,'Nguon: thamconhantao.vn',106.6679,10.7746,'27 Bắc Hải, Phường 14 (Quận 10, Hồ Chí Minh)','Quận 10','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(11,'Sân bóng PHÚ THỌ',NULL,'Nguon: thamconhantao.vn',106.645,10.763,'2 Lê Đại Hành (Quận 11, Hồ Chí Minh)','Quận 11','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(12,'Sân bóng THÀNH PHÁT-CÔNG TY XDTT THÀNH PHÁT',NULL,'Nguon: thamconhantao.vn',106.645,10.763,'CLB thể thao Phú Thọ - Số 4 Lê Đại Hành (Quận 11, Hồ Chí Minh)','Quận 11','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(13,'sân bóng đá cỏ nhân tạo cầu suối',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'52k dương thị mười khu phố1 phường tân chánh hiệp quận 12 (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(14,'Sân Bóng Hồ Bơi Trung Đoàn Gia Định',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'559 Tô Ký, Phường Trung Mỹ Tây (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(15,'Sân bóng SSA Quận 2',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'28 Thảo Điền, Phường Thảo Điền (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(16,'Sân bóng đá mini cỏ nhân tạo Đường Tô Ký',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'Đường Tô Ký (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(17,'Sân bóng Anh Tú Đường Trung Mỹ Tây 2A',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'Đường Trung Mỹ Tây 2A (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(18,'Sân bóng Minh Trí Đường Đông Hưng Thuận 11',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'Đường Đông Hưng Thuận 11 (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(19,'Sân bóng mini Hữu Nghị Đường An Phú Đông 9',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'Đường An Phú Đông 9 (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(20,'Sân bóng đá cỏ nhân tạo trường cao đẳng GTVT Đường Nguyễn Ảnh Thủ',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'Đường Nguyễn Ảnh Thủ (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(21,'Sân cỏ nhân tạo Thùy Linh',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'Nguyễn Ảnh Thủ (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(22,'Sân bóng đá mini cỏ nhân tạo Lan Anh',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'70/6, Tân Thới Nhất 5, P. Tân Thới Nhất (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(23,'Sân Bóng Đá Mini Quang Trung - Tân Chánh Hiệp 35',NULL,'Nguon: thamconhantao.vn',106.6238217,10.8556272,'Tân Chánh Hiệp 35, P. Tân Chánh Hiệp (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:30:18'),(24,'Sân cỏ nhân tạo THANH PHAT',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'38/6B Nguyễn Ảnh Thủ,Tổ 46 – KP.4,P.Hiệp Thành (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(25,'Sân bóng Mai Vàng',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'2/25B đường ĐHT 02, KP5, p. Tân Hưng Thuận (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(26,'Sân bóng đá Cây Sộp',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'1/96B Nguyễn Văn Quá, Đông Hưng Thuận (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(27,'Sân bóng đá Nguyễn Gia',NULL,'Nguon: thamconhantao.vn',106.6415,10.8678,'39 Nguyễn Ảnh Thủ, Tân Chánh Hiệp (Quận 12, Hồ Chí Minh)','Quận 12','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(28,'Sân bóng đá Lam Sơn Q5',NULL,'Nguon: thamconhantao.vn',106.6664,10.7557,'320/1 Trần Bình Trọng, 04 (Quận 5, Hồ Chí Minh)','Quận 5','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(29,'Sân Bóng Đá Mini Đức Tân',NULL,'Nguon: thamconhantao.vn',106.635,10.746,'97 Lý Chiêu Hoàng P.10 (Quận 6, Hồ Chí Minh)','Quận 6','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(30,'Sân bóng THÉP MIỀN NAM CẢNG SÀI GÒN',NULL,'Nguon: thamconhantao.vn',106.7219,10.733,'KP4 đường Tân Mỹ Phường Tân Thuận Tây (Quận 7, Hồ Chí Minh)','Quận 7','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(31,'Sân bóng Hoàng Kim',NULL,'Nguon: thamconhantao.vn',106.7219,10.733,'615 Huỳnh Tấn Phát, Tân Thuận Đông (Quận 7, Hồ Chí Minh)','Quận 7','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(32,'Sân bóng đá Cao Lỗ',NULL,'Nguon: thamconhantao.vn',106.6297,10.7245,'Số 130 Cao Lỗ, 04 (Quận 8, Hồ Chí Minh)','Quận 8','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(33,'Sân bóng Long Trường',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'552 Đường Lã Xuân Oai, Phường Long Trường (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(34,'Sân Bóng Cỏ Nhân Tạo Kaly',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'179.ĐÌNH PHONG PHÚ TĂNG NHƠN PHÚ B (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(35,'Sân bóng TTTDTT Quận 9',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'343 Lê Văn Việt, P.Tăng Nhơn Phú A (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(36,'Sân bóng Câu Lạc Bộ TDTT Hoàng Phú',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'Lô E, Lê Văn Việt, Phường Tăng Nhơn Phú A (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(37,'Sân Bóng Đá Cỏ Nhân Tạo Hoàng Phú',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'ĐƯỜNG 447B, Quận 9, Thành Phố Hồ Chí Minh, Việt Nam (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(38,'Sân bóng đá mini cỏ nhân tạo Phù Đổng',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'255 Đỗ Xuân Hợp (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(39,'Sân bóng đá mini cỏ nhân tạo Trung tâm TDTT Quận 9',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'343 Lê Văn Việt, P.Tăng Nhơn Phú A (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(40,'Sân bóng Hiệp Phú',NULL,'Nguon: thamconhantao.vn',106.6821947,10.7567056,'Trương Vạn Thành (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:30:18'),(41,'Sân bóng Tiến Phát',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'Quang Trung, Q.9 (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(42,'Sân bóng Lam Sơn',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'Lã Xuân Oa (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(43,'Sân bóng Lâm Thịnh',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'Đường số 2, P.Tăng Nhơn Phú B (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(44,'Sân bóng Hoàng Thịnh',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'Lô E, Khu Phố 2, P.Tăng Nhơn Phú (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(45,'SÂN bóng THÀNH PHÁT-CÔNG TY XDTT THÀNH PHÁT',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'CLB Bóng đá Phước Long A, 146 khu phố A, đường Nam Hòa, phường Phước Long A (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(46,'Sân bóng đá Đại Châu',NULL,'Nguon: thamconhantao.vn',106.8287,10.8428,'99 Man Thiện, Hiệp Phú (Quận 9, Hồ Chí Minh)','Quận 9','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(47,'Sân bóng mini Hải Long',NULL,'Nguon: thamconhantao.vn',106.6038,10.7653,'Đường số 7-Quốc Lộ 1A (Quận Bình Tân, Hồ Chí Minh)','Quận Bình Tân','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(48,'Sân Bóng Đá Số 3 KCN Tân Tạo',NULL,'Nguon: thamconhantao.vn',106.6038,10.7653,'ĐƯỜNG SỐ 3 KCN TÂN TẠO (Quận Bình Tân, Hồ Chí Minh)','Quận Bình Tân','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(49,'Sân Bóng Chế Lan Viên',NULL,'Nguon: thamconhantao.vn',106.6038,10.7653,'100 Chế Lan Viên - Tây Thạnh (Quận Bình Tân, Hồ Chí Minh)','Quận Bình Tân','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(50,'Sân Bóng Lê Thành',NULL,'Nguon: thamconhantao.vn',106.6038,10.7653,'103/1 An Dương Vương, An Lạc (Quận Bình Tân, Hồ Chí Minh)','Quận Bình Tân','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(51,'Sân bóng đá mini - Cafe sân vườn Marina',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'193/11 Điện Biên Phủ, P.15 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(52,'Sân bóng Hồng Bàng Marina Dien Bien Phu',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'193/11 Điện Biên Phủ, P15 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(53,'Sân Bóng Đá Mini Victory',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'426/1 Bình Quới, Phường 28 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(54,'SÂN BÓNG ĐÁ MINI SỐ 4 CHU VĂN AN',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'Cuối đường số 6, Cư Xá Chu Văn An, P.26 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(55,'Sân bóng đá mini Hoa Lư',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'Đường D3, Phường 25 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(56,'Sân Bóng MiNi Thiên Trường',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'256 D2. Phường 25, Quận Bình Thạnh (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(57,'Sân cỏ nhân tạo Thanh Đa',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'CLB Thể dục thể thao Thanh Đa . Số 1017 Binh Quoi, P28 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(58,'Sân cỏ nhân tạo Chu Văn An',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'Đường số 4, Chu Văn An, phường 26 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(59,'Sân cỏ nhân tạo Phương Nam',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'164 Nguyễn Xí, phường 26 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(60,'Sân bóng đá mini cỏ nhân tạo Thái',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'343/26, Nơ Trang Long (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(61,'Cụm sân cỏ nhân tạo D3',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'44 Đường D3, phường 25, Bình Thạnh, Sát trường ĐH Giao Thông Vận Tải (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(62,'Sân Bóng Đá Cỏ Nhân Tạo Ngôi Sao - HCA',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'324 Chu Văn An, p.12 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(63,'Sân bóng Chu Văn An',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'Đường số 4, Chu Văn An, phường 26 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(64,'Sân bóng THANH PHAT - CÔNG TY XD THỂ THAO THANH PHAT',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'CLB Thể dục thể thao Thanh Đa. Số 1017 Binh Quoi, P28 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(65,'Sân bóng Thái 343/26 Nơ Trang Long',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'343/26 Nơ Trang Long, 13 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(66,'Sân bóng đá D3',NULL,'Nguon: thamconhantao.vn',106.7091,10.8106,'44 Đường D3, Phường 25 (Quận Bình Thạnh, Hồ Chí Minh)','Quận Bình Thạnh','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(67,'Sân bóng đá Quyết Tâm 2',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'350/118/11 Nguyễn Văn Lượng P.16 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(68,'CLB Bóng Đá Mini Nhân Tạo Đại Nam',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'34/1A, Quang Trung Phường 8 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(69,'Sân cỏ nhân tạo Thống Nhất',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'33/3 A THỐNG NHẤT, PHƯỜNG 10 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(70,'Sân bóng đá mini QUANG TRUNG',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'379/99/23 Quang Trung, Phường 10 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(71,'Sân cỏ nhân tạo Phương Nam 2',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'44/5 Phạm Văn Chiêu, phường 9 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(72,'Sân bóng QUANG TUYẾN 3',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'73/496D đường Phan Huy Ích, P.12 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(73,'Sân bóng QUANG TUYẾN 1 VÀ 2',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'44/3 Tổ 37, Đường Phạm Văn Chiêu, P.9 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(74,'Sân bóng Thành Lâm',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'134/5 Đường 30, phường 17 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(75,'Sân bóng Minh Tiến',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'khu thể thao bệnh viện 175 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(76,'Sân cỏ nhân tạo Minh Tiến',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'18 Phan Văn Trị, Phường 10 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(77,'Sân bóng Cây Trâm',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'48/5 Phạm Văn Chiêu P4 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(78,'Sân bóng Hải Sơn',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'Số 5 đường số 20, phường 6 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(79,'Sân bóng Bình An',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'17/1D Cây Trâm, phường 9 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(80,'Sân bóng An Hội',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'60/407 Khu phố 4, Phan Huy Ích, phường 12 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(81,'Sân bóng CLB Bóng Đá Phương Đô',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'37 Nguyễn Văn Lượng P.10 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(82,'Sân bóng 230',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'230 Tân Sơn (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(83,'Sân bóng 123',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'230 Tân Sơn (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(84,'Sân bóng đá 77',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'152 Nguyễn Oanh, Phường 17 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(85,'Sân bóng Đạt Đức',NULL,'Nguon: thamconhantao.vn',106.6653,10.8387,'5A Nguyễn Văn Lượng, Phường 17 (Quận Gò Vấp, Hồ Chí Minh)','Quận Gò Vấp','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(86,'Sân Kingsport 36 Hoa Sữa',NULL,'Nguon: thamconhantao.vn',106.68,10.7991,'36 Hoa Sữa, P.7 (Quận Phú Nhuận, Hồ Chí Minh)','Quận Phú Nhuận','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(87,'Sân Bóng Quyết Tâm',NULL,'Nguon: thamconhantao.vn',106.68,10.7991,'34 Nguyễn Văn Lượng, phường 16 (Quận Phú Nhuận, Hồ Chí Minh)','Quận Phú Nhuận','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(88,'Sân bóng Đào Duy Anh',NULL,'Nguon: thamconhantao.vn',106.68,10.7991,'21 Đào Duy Anh, phường 14 (Quận Phú Nhuận, Hồ Chí Minh)','Quận Phú Nhuận','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(89,'Sân bóng PHÚ NHUẬN',NULL,'Nguon: thamconhantao.vn',106.68,10.7991,'3 Hoàng Minh Giám p9 (Quận Phú Nhuận, Hồ Chí Minh)','Quận Phú Nhuận','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(90,'Sân bóng mini 20 Cộng Hoà',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'20 Cộng Hoà, phường 4, (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(91,'Sân Bóng Đá TRUNG TÂM MIỀN NAM',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'Đường số 14, KDC Vĩnh Lộc, P.Bình Hưng Hòa B (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(92,'Trung Tâm Tổ Hợp Sân Bóng Cỏ Tự Nhiên tân sơn -917 - 370',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'Hoàng Hoa Thám (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(93,'Sân Bóng Đá Mini Phúc Yên',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'43 Phan Huy Ích ,P15 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(94,'Sân cỏ nhân tạo Huỳnh Tấn – Cộng Hòa',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'18C Cộng hòa, P4 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(95,'Sân cỏ nhân tạo Khu Thể Thao K2',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'194 Trân Văn Dư, P 13, Q. Tân Bình (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(96,'Sân bóng CLB 367',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'367 Hoàng Hoa Thám p12 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(97,'Sân bóng tạo A41 – Cộng Hòa',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,': 18C Cộng hòa (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(98,'Sân bóng D36 – Hoàng Hoa Thám',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'Gần cuối đường Hoàng Hoa Thám (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(99,'Sân bóng đá Chảo Lửa',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'Ở bên trong Sân Banh Chảo Lửa, 02 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(100,'Sân bóng HUẤN LUYỆN BAY',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'117 Hồng Hà phường 2 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(101,'Sân bóng QUỐC PHÒNG 2 - QUÂN KHU 7',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'2 Sân Vận Động Quân Khu 7 Đường Phổ Quang Phường 2 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(102,'Sân bóng TRUNG TÂM THỂ THAO A 2',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'18D Cộng Hòa, P.4 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(103,'Sân bóng đá Thăng Long',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'Số 2 Phan Thúc Duyện, 15 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(104,'Sân bóng đá Hoàng Gia',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'Số 4 Trường Chinh, 15 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(105,'Sân bóng Bảo Anh',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'Kế 90 đường số 4, Bình Hưng Hòa (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(106,'Sân bóng đá K334',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'119 Trần Văn Dư, P.13, Q.Tân Bình (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(107,'Sân bóng đá K2',NULL,'Nguon: thamconhantao.vn',106.652,10.8017,'194 Trần Văn Dư, Phường 13 (Quận Tân Bình, Hồ Chí Minh)','Quận Tân Bình','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(108,'Sân Bóng Đá Tân Thới Hòa',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'17/5 Lương Minh Nguyệt, Phường Tân Thới Hoà (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(109,'Sân bóng đá phường Tân Sơn Nhì',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'905/4 Âu Cơ, Phường Tân Sơn Nhì (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(110,'Sân Bóng Đá Mini Lâm Thịnh C1',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'72 Nguyễn Văn Yến (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(111,'Sân bóng đá mi ni Lê Lợi',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'trường trung học cơ sở Lê Lợi, phường Tây Thạnh (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(112,'Sân Bóng Tuổi Thơ',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'318 Trịnh Đình Trọng, Hòa Thạnh (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(113,'Sân cỏ nhân tạo Phương Đô',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'18C Cộng Hòa (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(114,'Sân Bóng Đá Celadon City - Tân Phú',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'36 Bờ Bao Tân Thắng, Phường Sơn Kỳ (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(115,'Cụm sân bóng đá mini Sport Plus',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'E3, Kênh 19/5, P. Sơn Kỳ (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(116,'Sân bóng đá mini Gia Nguyễn',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'252/1, Phan Anh (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(117,'Sân bóng Hoà Thạnh',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'318 Trịnh Đình Trọng, Hòa Thạnh (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(118,'Sân bóng Phường Tây Thạnh',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'71/2/40 Chế Lan Viên, P.Tây Thạnh (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(119,'Sân bóng Hiệp Tân',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'161/3 Lũy Bán Bích , Phường Hiệp Tân (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(120,'Sân bóng PHƯỜNG TÂY THẠNH',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'55 Dương Đức Hiển p.Tây Thạnh (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(121,'Sân bóng TÂN THẮNG',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'Bờ bao Tân thắng ( đối diện chợ Sơn Kỳ ) P.Sơn Kỳ (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(122,'Sân bóng Hòa Thạnh',NULL,'Nguon: thamconhantao.vn',106.6275,10.7915,'118/80 Hùynh Thiện Lộc, Hoà Thạnh (Quận Tân Phú, Hồ Chí Minh)','Quận Tân Phú','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(123,'Sân Bóng Đá Mini Linh Xuân Thủ Đức',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'33/55 ĐƯỜNG SỐ 8, LINH XUÂN (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(124,'Sân bóng AT Thủ Đức',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'35/11 Đường số 4 P. Trường Thọ (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(125,'Cụm sân bóng ĐH Nông Lâm',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Trường ĐH Nông Nông TP.HCM - Khu phố 6, P. Linh Trung (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(126,'Sân bóng đá mini Ti Gôn',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'64 Đường 10 Phường Tam Bình (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(127,'Sân Bóng Cá Sấu Hoa Cà',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'61/1 Đường 48, Phường Hiệp Bình Chánh (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(128,'Sân Bóng Đá Linh Đông',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Số 26 Đường 30 Kp7 Phường Linh Đông (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(129,'Sân Bóng đá mini Việt Thắng',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'127 Lê Văn Chí, P. Linh Trung (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(130,'Sân bóng HoSaNa',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Đường QL13, P. Hiệp Bình Chánh (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(131,'Sân bóng Nhà Thiếu Nhi Quận Thủ Đức',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'281 Võ Văn Ngân (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(132,'Sân bóng Trường CĐ Công Nghệ Thủ Đức',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Số 53 Võ Văn Ngân, P. Linh Chiểu (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(133,'Sân bóng SaKê',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Số 12 đường 42, P.Linh Đông (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(134,'Sân bóng Quả Bóng Vàng',NULL,'Nguon: thamconhantao.vn',106.7280382,10.844215,'Đường 39 (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:30:18'),(135,'Sân bóng Linh Đông',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'số 26 , đường 30 , p Linh Đông (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(136,'Sân Bóng Đá KHIẾT TÂM',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'251 - Lê Thị Hoa - Phường Bình Chiểu (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(137,'Sân bóng đá trường Cao Đẳng Công Nghệ Thủ Đức',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Số 53 Võ Văn Ngân, Linh Chiểu (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(138,'Sân bóng đá Đông Nhựt',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Đường số 8, Hiệp Bình Phước (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(139,'Sân bóng Linh Tây',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'16 Trần Văn Nửa, Linh Tây (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(140,'Sân bóng đá Phúc Thành',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Đường 47, Hiệp Bình Chánh (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(141,'Sân bóng đá Ông Bầu',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'6/409 QL13, Hiệp Bình Phước (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49'),(142,'Sân Bóng Đá Bình Triệu 3',NULL,'Nguon: thamconhantao.vn',106.7536,10.8494,'Số 51 Đường số 20, Hiệp Bình Chánh (Quận Thủ Đức, Hồ Chí Minh)','Quận Thủ Đức','Hồ Chí Minh',400000,300000,450000,0,0,0,0,0,0,1,'ACTIVE',0,0,5,0,NULL,'2026-04-14 17:28:47','2026-04-14 23:36:49');
/*!40000 ALTER TABLE `venues` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 22:38:10
