@echo off
title OpenLLM Monitor - Seed Data Generator

echo.
echo =========================================
echo 🚀 OpenLLM Monitor - Seed Data Generator
echo =========================================
echo.

cd /d "%~dp0"
echo 📂 Working directory: %CD%
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detected: %NODE_VERSION%
echo.

:: Install dependencies
echo 📦 Installing dependencies...
call npm install --silent
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

echo 🌱 Starting seed data generation...
echo.

:: Run the seed script
node seed-data.js
if errorlevel 1 (
    echo ❌ Failed to generate seed data
    pause
    exit /b 1
)

echo.
echo 🎉 Seed data generation completed successfully!
echo.
echo 🔗 Next Steps:
echo    1. Start your OpenLLM Monitor application
echo    2. Open the dashboard in your browser
echo    3. Explore the analytics and monitoring features
echo.
echo 📊 Dashboard Features Now Available:
echo    • Real-time request monitoring
echo    • Provider performance comparison
echo    • Cost analysis and tracking
echo    • Error rate monitoring
echo    • Token usage analytics
echo    • Historical trends and patterns
echo.

pause
