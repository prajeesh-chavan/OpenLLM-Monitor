#!/bin/bash

# Docker Configuration Validation Script
echo "🔍 Validating Docker configuration for OpenLLM Monitor..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation results
VALIDATION_PASSED=true

# Function to print status
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "✅ ${GREEN}$1${NC}"
    else
        echo -e "❌ ${RED}$1${NC}"
        VALIDATION_PASSED=false
    fi
}

print_warning() {
    echo -e "⚠️  ${YELLOW}$1${NC}"
}

echo "Checking prerequisites..."

# Check if Docker is installed
docker --version >/dev/null 2>&1
print_status "Docker is installed" $?

# Check if Docker is running
docker info >/dev/null 2>&1
print_status "Docker daemon is running" $?

# Check if Docker Compose is available
if docker compose version >/dev/null 2>&1; then
    print_status "Docker Compose v2 is available" 0
elif docker-compose --version >/dev/null 2>&1; then
    print_status "Docker Compose v1 is available" 0
    print_warning "Consider upgrading to Docker Compose v2"
else
    print_status "Docker Compose is not available" 1
fi

echo ""
echo "Checking Docker configuration files..."

# Check if required files exist
required_files=(
    "docker-compose.yml"
    "docker-compose-with-ollama.yml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "scripts/init-mongo.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists" 0
    else
        print_status "$file is missing" 1
    fi
done

# Check if .dockerignore files exist
if [ -f "backend/.dockerignore" ]; then
    print_status "Backend .dockerignore exists" 0
else
    print_warning "Backend .dockerignore is missing (recommended)"
fi

if [ -f "frontend/.dockerignore" ]; then
    print_status "Frontend .dockerignore exists" 0
else
    print_status "Frontend .dockerignore exists" 0
fi

echo ""
echo "Validating Docker Compose configuration..."

# Validate docker-compose.yml syntax
docker-compose -f docker-compose.yml config >/dev/null 2>&1
print_status "docker-compose.yml syntax is valid" $?

# Validate docker-compose-with-ollama.yml syntax
docker-compose -f docker-compose-with-ollama.yml config >/dev/null 2>&1
print_status "docker-compose-with-ollama.yml syntax is valid" $?

# Check if production config exists and validate it
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml config >/dev/null 2>&1
    print_status "docker-compose.prod.yml syntax is valid" $?
fi

echo ""
echo "Checking Docker build context..."

# Check if package.json files exist
if [ -f "backend/package.json" ]; then
    print_status "Backend package.json exists" 0
else
    print_status "Backend package.json is missing" 1
fi

if [ -f "frontend/package.json" ]; then
    print_status "Frontend package.json exists" 0
else
    print_status "Frontend package.json is missing" 1
fi

# Check if nginx.conf exists for frontend
if [ -f "frontend/nginx.conf" ]; then
    print_status "Frontend nginx.conf exists" 0
else
    print_status "Frontend nginx.conf is missing" 1
fi

# Check if healthcheck.js exists for backend
if [ -f "backend/healthcheck.js" ]; then
    print_status "Backend healthcheck.js exists" 0
else
    print_status "Backend healthcheck.js is missing" 1
fi

echo ""
echo "Checking environment configuration..."

# Check if environment template exists
if [ -f ".env.docker.template" ]; then
    print_status "Environment template exists" 0
else
    print_warning "Environment template is missing (optional)"
fi

# Check for common environment issues
if grep -q "localhost" docker-compose.yml; then
    print_warning "docker-compose.yml contains 'localhost' references - check service communication"
fi

echo ""
echo "Checking system resources..."

# Check available disk space (at least 10GB recommended)
available_space=$(df . | awk 'NR==2 {print $4}')
if [ "$available_space" -gt 10485760 ]; then  # 10GB in KB
    print_status "Sufficient disk space available" 0
else
    print_warning "Less than 10GB disk space available"
fi

# Check available memory (at least 4GB recommended)
if command -v free >/dev/null 2>&1; then
    available_memory=$(free -m | awk 'NR==2{print $7}')
    if [ "$available_memory" -gt 4096 ]; then
        print_status "Sufficient memory available" 0
    else
        print_warning "Less than 4GB memory available"
    fi
fi

echo ""
echo "Checking network ports..."

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2
    
    if command -v netstat >/dev/null 2>&1; then
        if netstat -tuln | grep -q ":$port "; then
            print_warning "Port $port is already in use (needed for $service)"
        else
            print_status "Port $port is available for $service" 0
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tuln | grep -q ":$port "; then
            print_warning "Port $port is already in use (needed for $service)"
        else
            print_status "Port $port is available for $service" 0
        fi
    else
        print_warning "Cannot check if port $port is available (netstat/ss not found)"
    fi
}

# Check required ports
check_port 3000 "Frontend"
check_port 3001 "Backend"
check_port 27017 "MongoDB"
check_port 8081 "Mongo Express"
check_port 11434 "Ollama"

echo ""
echo "🏁 Validation Summary:"

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "✅ ${GREEN}All critical validations passed!${NC}"
    echo -e "🚀 ${GREEN}Your Docker setup is ready to run.${NC}"
    echo ""
    echo "To start the services, run:"
    echo "  ./docker-setup.sh"
    echo "  or"
    echo "  docker-compose up -d --build"
else
    echo -e "❌ ${RED}Some validations failed.${NC}"
    echo -e "🔧 ${YELLOW}Please fix the issues above before running Docker setup.${NC}"
fi

echo ""
echo "For detailed setup instructions, see: DOCKER_GUIDE.md"
