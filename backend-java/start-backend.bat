@echo off
echo 🚀 Starting Football Connect Backend...
echo.
echo Step 1: Checking MongoDB connection...
mongosh --eval "db.adminCommand('ping')" mongodb://localhost:27017 --quiet

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ MongoDB is not running!
    echo Please start MongoDB service first:
    echo    net start MongoDB
    pause
    exit /b 1
)

echo ✅ MongoDB is running!
echo.
echo Step 2: Starting Spring Boot application...
echo Database: football_connect
echo Port: 8080
echo.

cd /d "%~dp0"
call mvn spring-boot:run

pause
