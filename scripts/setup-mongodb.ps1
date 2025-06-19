# OpenLLM Monitor MongoDB Setup Script for Windows PowerShell

Write-Host "🚀 OpenLLM Monitor - MongoDB Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

function Test-CommandExists {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Setup-Docker {
    Write-Host "📦 Setting up MongoDB with Docker..." -ForegroundColor Yellow
    
    if (!(Test-CommandExists "docker")) {
        Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
        Write-Host "   Visit: https://docs.docker.com/desktop/windows/" -ForegroundColor White
        exit 1
    }
    
    Write-Host "🔧 Starting MongoDB with Docker Compose..." -ForegroundColor Green
    docker-compose up -d mongodb
    
    Write-Host "⏳ Waiting for MongoDB to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "✅ MongoDB is running!" -ForegroundColor Green
    Write-Host "   📍 MongoDB URL: mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin" -ForegroundColor White
    Write-Host "   🌐 Mongo Express (Admin UI): http://localhost:8081 (admin/admin)" -ForegroundColor White
    
    Create-EnvFile "mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin"
}

function Setup-Atlas {
    Write-Host "☁️ Setting up MongoDB Atlas..." -ForegroundColor Yellow
    Write-Host "Please follow these steps:" -ForegroundColor White
    Write-Host "1. Go to https://www.mongodb.com/atlas" -ForegroundColor White
    Write-Host "2. Create a free account and cluster" -ForegroundColor White
    Write-Host "3. Click 'Connect' → 'Connect your application'" -ForegroundColor White
    Write-Host "4. Copy the connection string" -ForegroundColor White
    Write-Host ""
    
    $atlasUri = Read-Host "Enter your MongoDB Atlas connection string"
    
    if ([string]::IsNullOrEmpty($atlasUri)) {
        Write-Host "❌ No connection string provided." -ForegroundColor Red
        exit 1
    }
    
    Create-EnvFile $atlasUri
    Write-Host "✅ MongoDB Atlas configured!" -ForegroundColor Green
}

function Setup-Local {
    Write-Host "💻 Setting up local MongoDB..." -ForegroundColor Yellow
    
    if (Test-CommandExists "mongod") {
        Write-Host "✅ MongoDB is already installed locally" -ForegroundColor Green
        
        # Check if MongoDB service is running
        $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if ($mongoService -and $mongoService.Status -eq "Running") {
            Write-Host "✅ MongoDB service is already running" -ForegroundColor Green
        }
        else {
            Write-Host "🔧 Starting MongoDB service..." -ForegroundColor Yellow
            try {
                Start-Service -Name "MongoDB" -ErrorAction Stop
                Write-Host "✅ MongoDB service started" -ForegroundColor Green
            }
            catch {
                Write-Host "⚠️ Could not start MongoDB service automatically. Please start it manually." -ForegroundColor Yellow
            }
        }
        
        Create-EnvFile "mongodb://localhost:27017/openllm-monitor"
        Write-Host "✅ Local MongoDB configured!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ MongoDB is not installed locally." -ForegroundColor Red
        Write-Host "Installation instructions:" -ForegroundColor White
        Write-Host "  Download from: https://www.mongodb.com/try/download/community" -ForegroundColor White
        Write-Host "  Follow the Windows installation guide" -ForegroundColor White
    }
}

function Create-EnvFile {
    param($MongoUri)
    
    $jwtSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
    
    $envContent = @"
# MongoDB Configuration
MONGODB_URI=$MongoUri

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=$jwtSecret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WS_CORS_ORIGIN=http://localhost:5173

# LLM Provider API Keys (Add your keys here)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
# OPENROUTER_API_KEY=your-openrouter-api-key
# MISTRAL_API_KEY=your-mistral-api-key
"@
    
    $envContent | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "📝 Created backend\.env file" -ForegroundColor Green
}

function Test-Connection {
    Write-Host "🧪 Testing MongoDB connection..." -ForegroundColor Yellow
    
    if (Test-Path "backend\package.json") {
        Set-Location "backend"
        npm install *>$null
        
        $testScript = @"
const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
mongoose.connect(uri).then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
}).catch(err => {
    console.log('❌ MongoDB connection failed:', err.message);
    process.exit(1);
});
"@
        
        $testScript | Out-File -FilePath "test-connection.js" -Encoding UTF8
        node test-connection.js
        Remove-Item "test-connection.js"
        Set-Location ".."
    }
    else {
        Write-Host "⚠️ Backend dependencies not installed. Run 'npm install' in the backend directory." -ForegroundColor Yellow
    }
}

# Main menu
Write-Host ""
Write-Host "Choose your MongoDB setup option:" -ForegroundColor White
Write-Host "1. 🐳 Docker (Recommended for development)" -ForegroundColor White
Write-Host "2. ☁️ MongoDB Atlas (Cloud)" -ForegroundColor White
Write-Host "3. 💻 Local Installation" -ForegroundColor White
Write-Host "4. 🧪 Test existing connection" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" { Setup-Docker }
    "2" { Setup-Atlas }
    "3" { Setup-Local }
    "4" { Test-Connection; exit 0 }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host "📚 Next steps:" -ForegroundColor White
Write-Host "   1. cd backend && npm install" -ForegroundColor White
Write-Host "   2. npm start" -ForegroundColor White
Write-Host "   3. Open another terminal: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more information, see MONGODB_SETUP.md" -ForegroundColor White
