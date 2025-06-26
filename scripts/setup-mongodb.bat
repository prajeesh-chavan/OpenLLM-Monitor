@echo off
echo 🚀 OpenLLM Monitor - MongoDB Setup
echo ==================================
echo.

echo Choose your MongoDB setup option:
echo 1. Docker (Recommended for development)
echo 2. MongoDB Atlas (Cloud)
echo 3. Local Installation  
echo 4. Test existing connection
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto docker
if "%choice%"=="2" goto atlas
if "%choice%"=="3" goto local
if "%choice%"=="4" goto test
goto invalid

:docker
echo 📦 Setting up MongoDB with Docker...
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

echo 🔧 Starting MongoDB with Docker Compose...
docker-compose up -d mongodb

echo ⏳ Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

echo ✅ MongoDB is running!
echo    📍 MongoDB URL: mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin
echo    🌐 Mongo Express Admin UI: http://localhost:8081 (admin/admin)

call :create_env "mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin"
goto complete

:atlas
echo ☁️ Setting up MongoDB Atlas...
echo Please follow these steps:
echo 1. Go to https://www.mongodb.com/atlas
echo 2. Create a free account and cluster
echo 3. Click 'Connect' → 'Connect your application'
echo 4. Copy the connection string
echo.
set /p atlas_uri="Enter your MongoDB Atlas connection string: "

if "%atlas_uri%"=="" (
    echo ❌ No connection string provided.
    pause
    exit /b 1
)

call :create_env "%atlas_uri%"
echo ✅ MongoDB Atlas configured!
goto complete

:local
echo 💻 Setting up local MongoDB...
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not installed locally.
    echo Installation instructions:
    echo   Download from: https://www.mongodb.com/try/download/community
    echo   Follow the Windows installation guide
    pause
    exit /b 1
)

echo ✅ MongoDB is installed locally
sc query MongoDB >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ MongoDB service is available
    net start MongoDB >nul 2>nul
    if %errorlevel% equ 0 (
        echo ✅ MongoDB service started
    ) else (
        echo ✅ MongoDB service is already running
    )
) else (
    echo ⚠️ MongoDB service not found. Please start MongoDB manually.
)

call :create_env "mongodb://localhost:27017/openllm-monitor"
echo ✅ Local MongoDB configured!
goto complete

:test
echo 🧪 Testing MongoDB connection...
if not exist "backend\package.json" (
    echo ⚠️ Backend dependencies not installed. Run 'npm install' in the backend directory.
    pause
    exit /b 1
)

cd backend
call npm install >nul 2>nul
echo const mongoose = require('mongoose'); > test-connection.js
echo require('dotenv').config(); >> test-connection.js  
echo const uri = process.env.MONGODB_URI; >> test-connection.js
echo mongoose.connect(uri).then(() => { >> test-connection.js
echo   console.log('✅ MongoDB connection successful!'); >> test-connection.js
echo   process.exit(0); >> test-connection.js
echo }).catch(err => { >> test-connection.js
echo   console.log('❌ MongoDB connection failed:', err.message); >> test-connection.js
echo   process.exit(1); >> test-connection.js
echo }); >> test-connection.js

node test-connection.js
del test-connection.js
cd ..
pause
exit /b 0

:create_env
echo # MongoDB Configuration > backend\.env
echo MONGODB_URI=%~1 >> backend\.env
echo. >> backend\.env
echo # Server Configuration >> backend\.env
echo PORT=3001 >> backend\.env
echo NODE_ENV=development >> backend\.env
echo. >> backend\.env
echo # CORS Configuration >> backend\.env
echo FRONTEND_URL=http://localhost:5173 >> backend\.env
echo. >> backend\.env
echo # Security >> backend\.env
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> backend\.env
echo RATE_LIMIT_WINDOW_MS=900000 >> backend\.env
echo RATE_LIMIT_MAX_REQUESTS=100 >> backend\.env
echo. >> backend\.env
echo # WebSocket Configuration >> backend\.env
echo WS_CORS_ORIGIN=http://localhost:5173 >> backend\.env
echo. >> backend\.env
echo # LLM Provider API Keys (Add your keys here) >> backend\.env
echo # OPENAI_API_KEY=your-openai-api-key >> backend\.env
echo # ANTHROPIC_API_KEY=your-anthropic-api-key >> backend\.env
echo # OPENROUTER_API_KEY=your-openrouter-api-key >> backend\.env
echo # MISTRAL_API_KEY=your-mistral-api-key >> backend\.env

echo 📝 Created backend\.env file
goto :eof

:complete
echo.
echo 🎉 Setup complete!
echo 📚 Next steps:
echo    1. cd backend ^&^& npm install
echo    2. npm start
echo    3. Open another terminal: cd frontend ^&^& npm run dev
echo.
echo 📖 For more information, see docs/DEPLOYMENT.md (Database Setup section)
pause
exit /b 0

:invalid
echo ❌ Invalid choice. Please run the script again.
pause
exit /b 1
