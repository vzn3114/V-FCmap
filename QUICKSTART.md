# 🚀 Quick Start Guide - Football Connect

## Prerequisites

Đảm bảo đã cài đặt:
- ☕ **Java 17+** ([Download](https://www.oracle.com/java/technologies/downloads/))
- 🔧 **Maven 3.8+** ([Download](https://maven.apache.org/download.cgi))
- 🍃 **MongoDB 6.0+** ([Download](https://www.mongodb.com/try/download/community))
- 📱 **Node.js 18+** ([Download](https://nodejs.org/))
- 📲 **Expo CLI** (cài sau khi có Node.js)

---

## 🏃 Chạy Backend (5 phút)

```bash
# 1. Di chuyển vào folder backend
cd backend-java

# 2. Copy file cấu hình
# Windows:
copy src\main\resources\application.properties src\main\resources\application-local.properties
# Mac/Linux:
cp src/main/resources/application.properties src/main/resources/application-local.properties

# 3. Mở MongoDB (nếu chưa chạy)
# Windows: Tìm MongoDB trong Start Menu
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 4. Build project
mvn clean install -DskipTests

# 5. Chạy server
mvn spring-boot:run
```

✅ Backend sẽ chạy tại: **http://localhost:8080**
✅ Swagger UI: **http://localhost:8080/swagger-ui.html**

---

## 📱 Chạy Frontend Mobile (3 phút)

```bash
# 1. Di chuyển vào folder frontend
cd frontend-mobile

# 2. Cài đặt Expo CLI (nếu chưa có)
npm install -g expo-cli

# 3. Cài dependencies
npm install

# 4. Chạy app
npm start
```

### Chạy trên thiết bị:

**Android Emulator:**
- Ấn `a` trong terminal

**iOS Simulator (chỉ MacOS):**
- Ấn `i` trong terminal

**Web Browser:**
- Ấn `w` trong terminal

**Physical Device:**
1. Cài app **Expo Go** từ App Store/Play Store
2. Quét QR code từ terminal

---

## ⚙️ Cấu hình nhanh (Optional)

### Backend - File `application-local.properties`:

```properties
# Chỉ cần thay đổi nếu MongoDB không ở localhost
spring.data.mongodb.uri=mongodb://localhost:27017/football_connect

# JWT Secret (đổi thành chuỗi ngẫu nhiên)
jwt.secret=my-super-secret-key-change-this-please-min-256-bits

# CORS - thêm địa chỉ IP máy của bạn nếu test trên điện thoại
cors.allowed-origins=http://localhost:3000,http://localhost:19006,exp://192.168.1.100:8081
```

### Frontend - File `src/services/api.js`:

```javascript
// Nếu test trên thiết bị thật, thay đổi:
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:8080/api'  // Thay YOUR_COMPUTER_IP
  : 'https://your-api.com/api';
```

Để tìm IP máy:
- **Windows**: Chạy `ipconfig` → tìm IPv4 Address
- **Mac/Linux**: Chạy `ifconfig` → tìm inet

---

## 🧪 Test API

### Sử dụng Swagger UI:
1. Mở http://localhost:8080/swagger-ui.html
2. Test các endpoints trực tiếp

### Hoặc dùng cURL:

```bash
# Health check
curl http://localhost:8080/actuator/health

# Test API (khi đã implement)
curl http://localhost:8080/api/venues
```

---

## 🐛 Troubleshooting

### Backend không chạy?
```bash
# Kiểm tra Java version
java -version  # Phải >= 17

# Kiểm tra MongoDB
mongosh  # Phải kết nối được

# Kiểm tra port 8080
# Windows: netstat -ano | findstr :8080
# Mac/Linux: lsof -i :8080
```

### Frontend không connect được backend?
```bash
# Android Emulator: Phải dùng 10.0.2.2 thay vì localhost
const API_BASE_URL = 'http://10.0.2.2:8080/api';

# iOS Simulator: Dùng localhost
const API_BASE_URL = 'http://localhost:8080/api';

# Physical Device: Dùng IP máy tính
const API_BASE_URL = 'http://192.168.1.100:8080/api';
```

### Metro bundler error?
```bash
npm start -- --reset-cache
```

---

## 📁 Cấu trúc Project

```
football-connect/
├── backend-java/          # Spring Boot API
│   ├── src/main/java/
│   └── pom.xml
├── frontend-mobile/       # React Native App
│   ├── src/
│   └── package.json
├── README.md             # Documentation đầy đủ
└── DEVELOPMENT.md        # Developer guide
```

---

## 🎯 Next Steps

1. ✅ Đọc **README.md** để hiểu full project
2. ✅ Đọc **DEVELOPMENT.md** để học cách develop
3. 🔨 Implement các API endpoints còn thiếu
4. 🎨 Hoàn thiện UI các screens
5. 🧪 Viết tests
6. 🚀 Deploy lên production

---

**Vấn đề?** Mở GitHub Issues hoặc liên hệ team!

Good luck! ⚽💪
