# Football Connect - Development Guide

## 🚀 Quick Start cho Developer

### 1. Setup Backend (Java Spring Boot)

```bash
# Clone project
git clone <repository-url>
cd football-connect/backend-java

# Cài đặt dependencies
mvn clean install

# Chạy MongoDB local (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Copy và config file properties
cp src/main/resources/application.properties src/main/resources/application-local.properties
# Chỉnh sửa application-local.properties với thông tin của bạn

# Run Spring Boot
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 2. Setup Frontend (React Native)

```bash
cd football-connect/frontend-mobile

# Install dependencies
npm install

# Start development server
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS (chỉ MacOS)
npm run ios
```

---

## 🏗️ Development Workflow

### Branch Strategy
```
main              # Production code
develop           # Development branch
feature/xxx       # Feature branches
bugfix/xxx        # Bug fix branches
hotfix/xxx        # Production hotfixes
```

### Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Build/config changes
```

**Ví dụ**:
```bash
git commit -m "feat: Add team ranking algorithm"
git commit -m "fix: Resolve booking conflict issue"
```

---

## 🧑‍💻 Backend Development

### Tạo Entity mới

1. **Tạo Entity class** trong `domain/entity/`:
```java
@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String message;
    // ... fields
}
```

2. **Tạo Repository** trong `domain/repository/`:
```java
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserId(String userId);
}
```

3. **Tạo Service** trong `service/`:
```java
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repository;
    
    public List<Notification> getByUserId(String userId) {
        return repository.findByUserId(userId);
    }
}
```

4. **Tạo Controller** trong `controller/`:
```java
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;
    
    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        // implementation
    }
}
```

### Testing Backend

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run với profile
mvn test -Dspring.profiles.active=test

# Generate coverage report
mvn clean test jacoco:report
# Report: target/site/jacoco/index.html
```

---

## 📱 Frontend Development

### Tạo Screen mới

1. **Tạo screen** trong `src/screens/`:
```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function MyNewScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">My Screen</Text>
      <Button onPress={() => navigation.goBack()}>
        Go Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

2. **Thêm vào Navigation** (`src/navigation/AppNavigator.js`):
```javascript
import MyNewScreen from '../screens/MyNewScreen';

// Trong Stack.Navigator:
<Stack.Screen 
  name="MyNew" 
  component={MyNewScreen}
  options={{ title: 'My New Screen' }}
/>
```

3. **Navigate đến screen**:
```javascript
navigation.navigate('MyNew');
```

### Tạo Redux Slice mới

```javascript
// src/redux/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notification/fetch',
  async () => {
    const response = await apiClient.get('/notifications/me');
    return response;
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      });
  },
});

export default notificationSlice.reducer;
```

Thêm vào `store.js`:
```javascript
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    // ... existing
    notification: notificationReducer,
  },
});
```

---

## 🔧 Debugging

### Backend Debugging

**IntelliJ IDEA / VS Code**:
1. Set breakpoint trong code
2. Run in Debug mode
3. Hoặc attach debugger: `mvn spring-boot:run -Dagentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005`

**Logs**:
```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MyService {
    public void myMethod() {
        log.info("This is info log");
        log.debug("Debug info: {}", variable);
        log.error("Error occurred", exception);
    }
}
```

### Frontend Debugging

**React Native Debugger**:
```bash
# Install
brew install --cask react-native-debugger  # Mac
# hoặc download từ GitHub

# Enable debug trong app
# Shake device > Debug
```

**Console logs**:
```javascript
console.log('Debug:', variable);
console.error('Error:', error);

// Redux logger
import logger from 'redux-logger';
const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
});
```

---

## 🧪 Testing

### Backend Unit Tests

```java
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    void testCreateUser() {
        // Arrange
        User user = User.builder()
            .email("test@test.com")
            .build();
        
        when(userRepository.save(any())).thenReturn(user);
        
        // Act
        User result = userService.createUser(new UserDTO());
        
        // Assert
        assertNotNull(result);
        assertEquals("test@test.com", result.getEmail());
    }
}
```

### Frontend Tests

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

test('should render login button', () => {
  const { getByText } = render(<LoginScreen />);
  const button = getByText('Login');
  expect(button).toBeTruthy();
});
```

---

## 🐛 Common Issues & Solutions

### Backend Issues

**Issue**: MongoDB connection failed
```bash
# Solution: Check MongoDB is running
docker ps
# or
mongosh
```

**Issue**: Port 8080 already in use
```bash
# Solution: Kill process or change port
lsof -ti:8080 | xargs kill -9
# hoặc trong application.properties:
server.port=8081
```

### Frontend Issues

**Issue**: Metro bundler error
```bash
# Solution: Clear cache
npm start -- --reset-cache
```

**Issue**: Cannot connect to backend
```javascript
// Android Emulator phải dùng:
const API_BASE_URL = 'http://10.0.2.2:8080/api';

// iOS Simulator:
const API_BASE_URL = 'http://localhost:8080/api';

// Physical device: Use computer's IP
const API_BASE_URL = 'http://192.168.1.100:8080/api';
```

---

## 📚 Resources

### Backend
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb)
- [JWT JJWT](https://github.com/jwtk/jjwt)

### Frontend
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)

---

## 👥 Team Workflow

1. **Pick a task** from project board
2. **Create branch**: `git checkout -b feature/task-name`
3. **Develop & test** locally
4. **Commit** with convention
5. **Push**: `git push origin feature/task-name`
6. **Create Pull Request** on GitHub
7. **Code review** by team
8. **Merge** to develop
9. **Deploy** to staging/production

---

**Happy Coding! ⚽🚀**
