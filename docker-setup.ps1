# OpenLLM Monitor Docker Setup Script for PowerShell

Write-Host "🚀 Setting up OpenLLM Monitor with Docker..." -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker Compose is available
try {
    docker compose version | Out-Null
} catch {
    try {
        docker-compose --version | Out-Null
    } catch {
        Write-Host "❌ Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Create necessary directories if they don't exist
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" | Out-Null }
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" | Out-Null }
if (!(Test-Path "data\mongodb")) { New-Item -ItemType Directory -Path "data\mongodb" | Out-Null }

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans 2>$null
docker-compose -f docker-compose-with-ollama.yml down --remove-orphans 2>$null

# Pull latest images
Write-Host "📥 Pulling latest Docker images..." -ForegroundColor Cyan
docker-compose pull

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Cyan

Write-Host "Which configuration would you like to use?" -ForegroundColor Yellow
Write-Host "1) Standard setup (requires Ollama running on host)" -ForegroundColor White
Write-Host "2) Full setup with Ollama in Docker" -ForegroundColor White
$choice = Read-Host "Enter your choice (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host "🏗️ Starting with standard configuration..." -ForegroundColor Green
        docker-compose up -d --build
    }
    "2" {
        Write-Host "🏗️ Starting with Ollama in Docker..." -ForegroundColor Green
        docker-compose -f docker-compose-with-ollama.yml up -d --build
    }
    default {
        Write-Host "❌ Invalid choice. Defaulting to standard configuration..." -ForegroundColor Red
        docker-compose up -d --build
    }
}

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services are now available at:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   - MongoDB: mongodb://localhost:27017" -ForegroundColor White
Write-Host "   - Mongo Express: http://localhost:8081 (admin/admin)" -ForegroundColor White
if ($choice -eq "2") {
    Write-Host "   - Ollama: http://localhost:11434" -ForegroundColor White
}
Write-Host ""
Write-Host "📝 To view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 To stop: docker-compose down" -ForegroundColor Yellow
Write-Host "🔄 To restart: docker-compose restart" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
