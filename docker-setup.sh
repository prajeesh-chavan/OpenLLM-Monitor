#!/bin/bash

# OpenLLM Monitor Docker Setup Script
echo "🚀 Setting up OpenLLM Monitor with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories if they don't exist
mkdir -p logs
mkdir -p data/mongodb

# Set proper permissions for logs directory
chmod 755 logs

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose-with-ollama.yml down --remove-orphans 2>/dev/null || true

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose pull

# Build and start services
echo "🔨 Building and starting services..."

# Ask user which configuration to use
echo "Which configuration would you like to use?"
echo "1) Standard setup (requires Ollama running on host)"
echo "2) Full setup with Ollama in Docker"
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "🏗️ Starting with standard configuration..."
        docker-compose up -d --build
        ;;
    2)
        echo "🏗️ Starting with Ollama in Docker..."
        docker-compose -f docker-compose-with-ollama.yml up -d --build
        ;;
    *)
        echo "❌ Invalid choice. Defaulting to standard configuration..."
        docker-compose up -d --build
        ;;
esac

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Services are now available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - MongoDB: mongodb://localhost:27017"
echo "   - Mongo Express: http://localhost:8081 (admin/admin)"
if [ "$choice" = "2" ]; then
    echo "   - Ollama: http://localhost:11434"
fi
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
