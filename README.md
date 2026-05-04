# FC-Vmap

Nền tảng Football Connect hỗ trợ ghép đội và đặt sân bóng.

## Tổng quan

Trang thai hien tai cua repository:

- Backend: Spring Boot REST API (Java 25, Maven, MySQL, JWT)
- Tài liệu API: Swagger UI (SpringDoc OpenAPI)
- AI Chatbot: skeleton theo luật (rule-based) để tư vấn sân
- Frontend-web: React + Redux Toolkit + Ant Design, da co luong Auth/Venues/Bookings va co the chay duoc

## Cấu trúc dự án hiện tại

```text
FC-Vmap/
├─ backend-java/
│  ├─ src/main/java/com/footballconnect/
│  │  ├─ config/                # Cấu hình OpenAPI
│  │  ├─ controller/            # Auth, Team, Venue, Booking, Matchmaking, Chatbot
│  │  ├─ domain/
│  │  │  ├─ entity/             # JPA entities
│  │  │  ├─ repository/         # Spring Data JPA repositories
│  │  │  └─ specification/      # Specification lọc venue
│  │  ├─ dto/                   # DTO request/response
│  │  ├─ exception/             # Xử lý exception tập trung
│  │  ├─ security/              # JWT + Spring Security
│  │  └─ service/               # Business logic + payment factory/strategy
│  ├─ src/main/resources/application.properties
│  ├─ database/schema.sql
│  └─ pom.xml
├─ frontend-web/
│  ├─ assets/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ index.html
│  └─ src/
│     ├─ navigation/
│     ├─ redux/slices/
│     ├─ screens/{auth,bookings,profile,teams,venues}/
│     ├─ services/
│     └─ theme/
└─ README.md
```

## Tech stack backend

- Spring Boot 4.0.0
- Java 25
- Spring Data JPA + Hibernate
- MySQL
- Spring Security + JWT (jjwt 0.12.3)
- Spring Validation
- SpringDoc OpenAPI 3.0.0 (Swagger UI)
- Lombok

## Tech stack frontend-web

- React 18
- Redux Toolkit + React Redux
- React Router DOM
- Axios + Interceptor gan JWT
- Ant Design 5
- Vite 5

## Các module backend đã có

- Authentication: đăng ký, đăng nhập, lấy user hiện tại
- Teams: danh sách, chi tiết, tạo, cập nhật, thành viên, lọc theo tier
- Venues: tìm kiếm đa điều kiện, tìm sân gần, chi tiết, tạo sân
- Bookings: tạo booking, booking của tôi, chi tiết, check-in, thanh toán
- Matchmaking: tìm đối, gợi ý, gửi challenge
- Chatbot (skeleton): health + message endpoint, nhận diện intent cơ bản và gợi ý sân

## Các module frontend-web đã có

- Auth: man hinh Dang nhap/Dang ky, luu token vao localStorage
- Venues: danh sach san + bo loc theo cac tham so backend Specification
- Bookings: tao booking + chon phuong thuc thanh toan (COD/BANK_TRANSFER)
- Error handling: toast notification tu response loi backend
- Routing: bao ve route can dang nhap (bookings/profile/teams)

## Tài khoản đăng nhập

Tài khoản mẫu đang có trong [backend-java/database/schema.sql](backend-java/database/schema.sql#L387):

- Email: admin@footballconnect.com
- Vai trò: ADMIN

Lưu ý quan trọng:

- Cột password trong dữ liệu mẫu đang là hash placeholder (`$2a$10$default`), nên không có mật khẩu plain text tương ứng để đăng nhập trực tiếp.
- Để đăng nhập test nhanh, hãy tạo tài khoản mới qua API `POST /api/auth/register`, sau đó dùng chính email/mật khẩu vừa tạo để `POST /api/auth/login`.

## Tài liệu API (Swagger)

Sau khi backend chạy thành công:

- Swagger UI: http://localhost:8080/swagger-ui.html
- Swagger UI direct index: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/api-docs

Lưu ý: đường dẫn /swagger-ui.html có thể trả về HTTP 302 và chuyển hướng sang /swagger-ui/index.html. Đây là hành vi bình thường.

## Chạy backend local

### Yêu cầu

- Java 25
- Maven 3.9+
- MySQL đang chạy tại localhost:3306
- Đã tạo database football_connect

### 1) Cấu hình database

Cấu hình mặc định nằm ở backend-java/src/main/resources/application.properties:

- spring.datasource.url dùng database football_connect
- spring.datasource.username mặc định là root
- spring.datasource.password mặc định là 200515

Bạn có thể ghi đè bằng biến môi trường:

- DB_URL
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET
- CLIENT_URL

### 2) Chạy backend

```bash
cd backend-java
mvn spring-boot:run
```

Log mong đợi:

- Tomcat started on port 8080
- Started FootballConnectApplication

### 3) Build và test

```bash
cd backend-java
mvn clean test
```

## Ghi chú bảo mật

- Không nên để password/secret production thật trong application.properties.
- Nên ưu tiên biến môi trường cho thông tin DB và JWT secret.
- Cần rotate JWT secret trước khi triển khai production.

## Chay frontend-web

frontend-web da duoc bootstrap day du. Chay nhu sau:

```bash
cd frontend-web
npm install
npm run dev
```

API base URL khuyến nghị khi phát triển local:

- http://localhost:8080/api

Nếu chạy trên thiết bị thật/emulator, dùng IP máy thay cho localhost.

## Chay toan bo project (backend + frontend)

Mo 2 terminal:

Terminal 1:

```bash
cd backend-java
mvn spring-boot:run
```

Terminal 2:

```bash
cd frontend-web
npm install
npm run dev
```

Sau do truy cap frontend tai http://localhost:5173.
Backend API van chay tai http://localhost:8080.

## Cập nhật kiến trúc gần đây

- Refactor Team, Venue, Matchmaking theo mô hình Controller -> Service
- Áp dụng Specification pattern cho lọc venue
- Áp dụng Factory/Strategy style cho xử lý payment
- Bổ sung Global exception handler
- Bổ sung Swagger/OpenAPI config
- Bổ sung chatbot skeleton (controller/service/dto)

## Mô hình truy cập và permission

Hệ thống kết hợp kiểm soát theo vai trò (RBAC) và kiểm soát theo quyền hạn chi tiết (permission-based):

- Vai trò cấp cao: ADMIN, VENUE_OWNER, PLAYER/USER
- Quyền theo cấp trang: route được bảo vệ bằng AccessRoute
- Quyền theo cấp hành động (CRUD): backend kiểm tra quyền ở service layer, không chỉ ở UI
- Quyền theo cấp dữ liệu: phân tách dữ liệu của tôi và dữ liệu toàn hệ thống (ví dụ bookings/reports)

### Role PLAYER

Permissions:

- Basic Player:
	- view_venue
	- create_booking
	- view_booking

- Captain (extended):
	- create_team
	- manage_team
	- invite_member
	- challenge_team

Giao diện frontend hiển thị động theo permission. PLAYER cơ bản chỉ thấy các thao tác cơ bản; khi người dùng là captain, UI mở thêm các thao tác quản lý đội, mời thành viên và thách đấu.

## Luồng chính và bảo mật giao tiếp

- Luồng xác thực: JWT (Spring Security filter + Axios interceptor)
- Luồng đặt chỗ: tìm kiếm sân -> chi tiết/chọn sân -> đặt chỗ -> thanh toán
- Luồng điều hướng: protected routes cho các trang cần đăng nhập
- Xử lý lỗi/ngoại lệ: chuẩn hóa phản hồi cho unauthorized, forbidden, bad request, not found, conflict

Frontend sử dụng Redux Toolkit để quản lý trạng thái và Axios interceptors để gửi JWT, thu hồi phiên khi gặp 401 và hiển thị thông báo lỗi thống nhất.

## Khắc phục sự cố nhanh

Nếu không mở được Swagger:

1. Kiểm tra backend có chạy thành công và không bị fail lúc startup.
2. Kiểm tra thông tin kết nối DB (MySQL access denied sẽ chặn toàn bộ ứng dụng).
3. Mở thử http://localhost:8080/api-docs trước.
4. Sau đó mở http://localhost:8080/swagger-ui/index.html.

Nếu startup fail, hãy xem log tại dòng Caused by đầu tiên để tìm đúng nguyên nhân gốc.

## Ghi chú maintain

README này mô tả đúng trạng thái hiện tại của repository, không mô tả các tính năng chỉ mới ở mức kế hoạch.
