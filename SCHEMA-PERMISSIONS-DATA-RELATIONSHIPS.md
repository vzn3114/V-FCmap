# FC-Vmap: Schema, Permissions, Data Relationships

Tai lieu nay tong hop chi tiet 3 nhom thong tin quan trong cua backend:

1. Database schema
2. Permission model (Spring Security + JWT)
3. Data relationships (quan he du lieu)

---

## 1) Schema

Nguon chinh:
- [backend-java/database/schema.sql](backend-java/database/schema.sql)

### 1.1 Danh sach bang

Co tong cong 18 bang:

1. `users`
2. `teams`
3. `team_members`
4. `team_preferred_play_times`
5. `team_achievements`
6. `venues`
7. `venue_fields`
8. `venue_images`
9. `venue_videos`
10. `venue_operating_hours`
11. `venue_popular_times`
12. `bookings`
13. `booking_bill_splits`
14. `matches`
15. `reviews`
16. `reports`
17. `matchmaking`
18. `matchmaking_preferred_play_times`

### 1.2 Bang users

Vi tri: [backend-java/database/schema.sql](backend-java/database/schema.sql#L11)

Muc dich:
- Luu thong tin tai khoan va profile nguoi dung (USER, VENUE_OWNER, ADMIN)

Cot chinh:
- `id` (PK, BIGINT AUTO_INCREMENT)
- `email` (UNIQUE, NOT NULL)
- `password` (hash)
- `role` (mac dinh `USER`)
- `longitude`, `latitude`, `address`, `district`, `city` (embedded location)
- `preferred_position`, `skill_level`
- `is_verified`, `is_banned`, `ban_reason`
- `fair_play_score`, `total_reviews`, `average_rating`
- `created_at`, `updated_at`

Index:
- `idx_email`
- `idx_role`

### 1.3 Bang teams + bang con

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L47)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L86)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L97)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L105)

Muc dich:
- Quan ly doi bong, captain, member, thanh tich

Cot/FK chinh:
- `teams.captain_id -> users.id` (`ON DELETE SET NULL`)

Bang con dang element collection:
- `team_members` (thanh vien doi)
- `team_preferred_play_times` (khung gio uu tien)
- `team_achievements` (thanh tich)

### 1.4 Bang venues + bang con

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L116)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L159)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L170)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L179)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L188)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L198)

Muc dich:
- Quan ly san bong, chu san, loai san, gia, tien ich, media, gio mo cua

Cot/FK chinh:
- `venues.owner_id -> users.id` (`ON DELETE SET NULL`)

Bang con:
- `venue_fields`
- `venue_images`
- `venue_videos`
- `venue_operating_hours`
- `venue_popular_times`

### 1.5 Bang bookings + bill split

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L206)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L242)

Muc dich:
- Dat san, check-in, theo doi thanh toan

Cot/FK chinh:
- `bookings.venue_id -> venues.id` (`ON DELETE CASCADE`)
- `bookings.booked_by_id -> users.id` (`ON DELETE SET NULL`)
- `bookings.team_id -> teams.id` (`ON DELETE SET NULL`)

Bang con:
- `booking_bill_splits` (chia hoa don)

### 1.6 Bang matches

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L253)

Muc dich:
- Quan ly tran dau (doi nha, doi khach, san, ket qua)

FK:
- `home_team_id -> teams.id`
- `away_team_id -> teams.id`
- `venue_id -> venues.id`
- `booking_id -> bookings.id`

### 1.7 Bang reviews

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L288)

Muc dich:
- Danh gia venue/team/user

FK:
- `reviewer_id -> users.id`
- `venue_id -> venues.id`
- `team_id -> teams.id`
- `user_id -> users.id`
- `booking_id -> bookings.id`

Rang buoc:
- `rating` co check `BETWEEN 1 AND 5`

### 1.8 Bang reports

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L322)

Muc dich:
- Bao cao vi pham doi voi user/team/venue

FK:
- `reporter_id -> users.id`
- `reported_user_id -> users.id`
- `reported_team_id -> teams.id`
- `reported_venue_id -> venues.id`
- `reviewed_by_id -> users.id`

### 1.9 Bang matchmaking

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L353)
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L379)

Muc dich:
- Tim doi thu va luu tieu chi ghep tran

FK:
- `team_id -> teams.id`
- `matched_team_id -> teams.id`
- `matchmaking_preferred_play_times.matchmaking_id -> matchmaking.id`

### 1.10 Seed data

Vi tri:
- [backend-java/database/schema.sql](backend-java/database/schema.sql#L387)

Co insert san 1 admin:
- email: `admin@footballconnect.com`
- role: `ADMIN`

---

## 2) Permissions

Nguon chinh:
- [backend-java/src/main/java/com/footballconnect/security/SecurityConfig.java](backend-java/src/main/java/com/footballconnect/security/SecurityConfig.java)
- [backend-java/src/main/java/com/footballconnect/security/CustomUserDetailsService.java](backend-java/src/main/java/com/footballconnect/security/CustomUserDetailsService.java)
- [backend-java/src/main/java/com/footballconnect/security/JwtAuthenticationFilter.java](backend-java/src/main/java/com/footballconnect/security/JwtAuthenticationFilter.java)
- [backend-java/src/main/java/com/footballconnect/security/JwtTokenProvider.java](backend-java/src/main/java/com/footballconnect/security/JwtTokenProvider.java)

### 2.1 Co che xac thuc

- Ung dung dung JWT stateless (`SessionCreationPolicy.STATELESS`)
- JWT duoc doc tu header `Authorization: Bearer <token>`
- Sau khi validate token, filter nap `Authentication` vao `SecurityContext`

### 2.2 Mapping role -> authority

Tai `CustomUserDetailsService`:
- role trong DB duoc map thanh authority dang `ROLE_<ROLE_NAME>`
- Vi du:
- `USER` -> `ROLE_USER`
- `VENUE_OWNER` -> `ROLE_VENUE_OWNER`
- `ADMIN` -> `ROLE_ADMIN`

### 2.3 Rule phan quyen endpoint

Tai `SecurityConfig`:

Public (`permitAll`):
- `/api/auth/**`
- `/api-docs/**`
- `/swagger-ui/**`
- `/swagger-ui.html`
- `/api/chatbot/**`
- `/actuator/health`

Public read-only:
- `GET /api/venues/**`
- `GET /api/teams/public/**`

Chi admin:
- `/api/admin/**` yeu cau `hasRole("ADMIN")`

Venue owner hoac admin:
- `/api/venues/owner/**` yeu cau `hasAnyRole("VENUE_OWNER", "ADMIN")`

Con lai:
- Bat buoc authenticated (`anyRequest().authenticated()`)

### 2.4 JWT claims

Tai `JwtTokenProvider`:
- token chua cac claim: `email`, `role`
- `subject` dang userId
- Co `issuedAt` va `expiration`

---

## 3) Data Relationships

Nguon schema FK:
- [backend-java/database/schema.sql](backend-java/database/schema.sql)

### 3.1 User <-> Team

- 1 user co the captain nhieu team (`teams.captain_id`)
- 1 team co nhieu thanh vien trong `team_members`
- `team_members` luu `user_id` dang gia tri, khong co FK toi `users` trong schema hien tai

### 3.2 User <-> Venue

- 1 user (owner) co the so huu nhieu venue (`venues.owner_id`)

### 3.3 Venue/User/Team <-> Booking

- 1 booking thuoc 1 venue
- 1 booking do 1 user dat
- 1 booking co the gan 1 team (nullable)
- 1 booking co nhieu dong chia tien trong `booking_bill_splits`

### 3.4 Match lien ket Team/Venue/Booking

- 1 match co:
- home team
- away team
- venue
- co the tro den booking lien quan

### 3.5 Matchmaking lien ket Team

- 1 record matchmaking thuoc 1 team khoi tao
- co the tro den 1 matched team
- co danh sach preferred play times trong bang rieng

### 3.6 Review lien ket da doi tuong

- reviewer la 1 user
- review co the target venue hoac team hoac user (tuy `review_type`)
- co the gan booking de lam ngu canh danh gia

### 3.7 Report lien ket da doi tuong

- reporter la 1 user
- doi tuong bi report co the la user/team/venue
- reviewed_by la user xu ly report (thuc te thuong la admin)

---

## 4) ORM Mapping (JPA) tuong ung schema

Cac entity map truc tiep:
- [backend-java/src/main/java/com/footballconnect/domain/entity/User.java](backend-java/src/main/java/com/footballconnect/domain/entity/User.java)
- [backend-java/src/main/java/com/footballconnect/domain/entity/Team.java](backend-java/src/main/java/com/footballconnect/domain/entity/Team.java)
- [backend-java/src/main/java/com/footballconnect/domain/entity/Venue.java](backend-java/src/main/java/com/footballconnect/domain/entity/Venue.java)
- [backend-java/src/main/java/com/footballconnect/domain/entity/Booking.java](backend-java/src/main/java/com/footballconnect/domain/entity/Booking.java)
- [backend-java/src/main/java/com/footballconnect/domain/entity/Match.java](backend-java/src/main/java/com/footballconnect/domain/entity/Match.java)
- [backend-java/src/main/java/com/footballconnect/domain/entity/Matchmaking.java](backend-java/src/main/java/com/footballconnect/domain/entity/Matchmaking.java)
- [backend-java/src/main/java/com/footballconnect/domain/entity/Review.java](backend-java/src/main/java/com/footballconnect/domain/entity/Review.java)
- [backend-java/src/main/java/com/footballconnect/domain/entity/Report.java](backend-java/src/main/java/com/footballconnect/domain/entity/Report.java)

Luu y:
- Nhieu thuoc tinh nested duoc map bang `@Embedded` va `@ElementCollection`.
- Vi vay schema co cac bang con phuc vu collection thay vi full relation entity-doc-lap.

---

## 5) Gap va canh bao hien tai

1. `team_members.user_id` chua co FK toi `users.id` trong schema
2. `booking_bill_splits.user_id` chua co FK toi `users.id` trong schema
3. Rule public cho `GET /api/teams/public/**` nhung controller hien tai chu yeu dung `/api/teams/**`
4. `/api/auth/me` nam duoi `/api/auth/**` (permitAll), nhung trong code van tu kiem tra authentication

---

## 6) Kiem tra nhanh khi van hanh

1. Dam bao DB `football_connect` duoc tao va migration schema da chay.
2. Tao user moi qua `/api/auth/register`, login lay JWT.
3. Thu endpoint theo tung role:
- USER
- VENUE_OWNER
- ADMIN
4. Kiem tra hanh vi 401/403 cho endpoint bi gioi han.
5. Kiem tra integrity khi xoa du lieu co lien ket (`CASCADE` vs `SET NULL`).
