@echo off
REM OpenLLM Monitor Docker Setup Script for Windows

echo 🚀 Setting up OpenLLM Monitor with Docker...

REM Check if Docker is running
docker version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    docker-compose --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Docker Compose is not available. Please install Docker Compose.
        pause
        exit /b 1
    )
)

REM Create necessary directories if they don't exist
if not exist "logs" mkdir logs
if not exist "data" mkdir data
if not exist "data\mongodb" mkdir data\mongodb

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down --remove-orphans >nul 2>&1
docker-compose -f docker/docker-compose-with-ollama.yml down --remove-orphans >nul 2>&1

REM Pull latest images
echo 📥 Pulling latest Docker images...
docker-compose pull

REM Build and start services
echo 🔨 Building and starting services...

echo Which configuration would you like to use?
echo 1) Standard setup (requires Ollama running on host)
echo 2) Full setup with Ollama in Docker
set /p choice=Enter your choice (1 or 2): 

if "%choice%"=="1" (
    echo 🏗️ Starting with standard configuration...
    docker-compose up -d --build
) else if "%choice%"=="2" (
    echo 🏗️ Starting with Ollama in Docker...
    docker-compose -f docker/docker-compose-with-ollama.yml up -d --build
) else (
    echo ❌ Invalid choice. Defaulting to standard configuration...
    docker-compose up -d --build
)

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service status
echo 📊 Service Status:
docker-compose ps

echo.
echo ✅ Setup complete!
echo.
echo 🌐 Services are now available at:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:3001
echo    - MongoDB: mongodb://localhost:27017
echo    - Mongo Express: http://localhost:8081 (admin/admin)
if "%choice%"=="2" (
    echo    - Ollama: http://localhost:11434
)
echo.
echo 📝 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo 🔄 To restart: docker-compose restart
echo.
pause
