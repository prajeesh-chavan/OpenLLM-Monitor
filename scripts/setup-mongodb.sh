#!/bin/bash

# OpenLLM Monitor MongoDB Setup Script

echo "🚀 OpenLLM Monitor - MongoDB Setup"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup MongoDB with Docker
setup_docker() {
    echo "📦 Setting up MongoDB with Docker..."
    
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first."
        echo "   Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    echo "🔧 Starting MongoDB with Docker Compose..."
    docker-compose up -d mongodb
    
    echo "⏳ Waiting for MongoDB to be ready..."
    sleep 10
    
    echo "✅ MongoDB is running!"
    echo "   📍 MongoDB URL: mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin"
    echo "   🌐 Mongo Express (Admin UI): http://localhost:8081 (admin/admin)"
    
    # Create .env file
    create_env_file "mongodb://admin:password123@localhost:27017/openllm-monitor?authSource=admin"
}

# Function to setup MongoDB Atlas
setup_atlas() {
    echo "☁️  Setting up MongoDB Atlas..."
    echo "Please follow these steps:"
    echo "1. Go to https://www.mongodb.com/atlas"
    echo "2. Create a free account and cluster"
    echo "3. Click 'Connect' → 'Connect your application'"
    echo "4. Copy the connection string"
    echo ""
    read -p "Enter your MongoDB Atlas connection string: " atlas_uri
    
    if [ -z "$atlas_uri" ]; then
        echo "❌ No connection string provided."
        exit 1
    fi
    
    create_env_file "$atlas_uri"
    echo "✅ MongoDB Atlas configured!"
}

# Function to setup local MongoDB
setup_local() {
    echo "💻 Setting up local MongoDB..."
    
    if command_exists mongod; then
        echo "✅ MongoDB is already installed locally"
        
        # Check if MongoDB is running
        if pgrep mongod > /dev/null; then
            echo "✅ MongoDB is already running"
        else
            echo "🔧 Starting MongoDB..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                brew services start mongodb/brew/mongodb-community
            elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                # Linux
                sudo systemctl start mongod
                sudo systemctl enable mongod
            else
                echo "⚠️  Please start MongoDB manually"
            fi
        fi
        
        create_env_file "mongodb://localhost:27017/openllm-monitor"
        echo "✅ Local MongoDB configured!"
    else
        echo "❌ MongoDB is not installed locally."
        echo "Installation instructions:"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "  macOS: brew install mongodb-community"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "  Ubuntu: sudo apt-get install mongodb"
        else
            echo "  Visit: https://docs.mongodb.com/manual/installation/"
        fi
    fi
}

# Function to create .env file
create_env_file() {
    local mongodb_uri="$1"
    
    cat > backend/.env << EOF
# MongoDB Configuration
MONGODB_URI=$mongodb_uri

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-change-this-in-production")
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WS_CORS_ORIGIN=http://localhost:5173

# LLM Provider API Keys (Add your keys here)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
# OPENROUTER_API_KEY=your-openrouter-api-key
# MISTRAL_API_KEY=your-mistral-api-key
EOF
    
    echo "📝 Created backend/.env file"
}

# Function to test connection
test_connection() {
    echo "🧪 Testing MongoDB connection..."
    cd backend
    if [ -f "package.json" ]; then
        npm install > /dev/null 2>&1
        node -e "
            const mongoose = require('mongoose');
            const uri = process.env.MONGODB_URI || require('dotenv').config() && process.env.MONGODB_URI;
            mongoose.connect(uri).then(() => {
                console.log('✅ MongoDB connection successful!');
                process.exit(0);
            }).catch(err => {
                console.log('❌ MongoDB connection failed:', err.message);
                process.exit(1);
            });
        " 2>/dev/null
    else
        echo "⚠️  Backend dependencies not installed. Run 'npm install' in the backend directory."
    fi
    cd ..
}

# Main menu
echo "Choose your MongoDB setup option:"
echo "1. 🐳 Docker (Recommended for development)"
echo "2. ☁️  MongoDB Atlas (Cloud)"
echo "3. 💻 Local Installation"
echo "4. 🧪 Test existing connection"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        setup_docker
        ;;
    2)
        setup_atlas
        ;;
    3)
        setup_local
        ;;
    4)
        test_connection
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo "📚 Next steps:"
echo "   1. cd backend && npm install"
echo "   2. npm start"
echo "   3. Open another terminal: cd frontend && npm run dev"
echo ""
echo "📖 For more information, see docs/DEPLOYMENT.md (Database Setup section)"
