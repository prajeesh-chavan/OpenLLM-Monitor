# Docker Configuration Validation Script for PowerShell

Write-Host "🔍 Validating Docker configuration for OpenLLM Monitor..." -ForegroundColor Cyan

# Validation results
$ValidationPassed = $true

# Function to print status
function Print-Status {
    param(
        [string]$Message,
        [boolean]$Success
    )
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
        $script:ValidationPassed = $false
    }
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

Write-Host "Checking prerequisites..." -ForegroundColor White

# Check if Docker is installed
try {
    docker --version | Out-Null
    Print-Status "Docker is installed" $true
} catch {
    Print-Status "Docker is not installed" $false
}

# Check if Docker is running
try {
    docker info | Out-Null
    Print-Status "Docker daemon is running" $true
} catch {
    Print-Status "Docker daemon is not running" $false
}

# Check if Docker Compose is available
try {
    docker compose version | Out-Null
    Print-Status "Docker Compose v2 is available" $true
} catch {
    try {
        docker-compose --version | Out-Null
        Print-Status "Docker Compose v1 is available" $true
        Print-Warning "Consider upgrading to Docker Compose v2"
    } catch {
        Print-Status "Docker Compose is not available" $false
    }
}

Write-Host ""
Write-Host "Checking Docker configuration files..." -ForegroundColor White

# Check if required files exist
$requiredFiles = @(
    "docker-compose.yml",
    "docker-compose-with-ollama.yml",
    "backend\Dockerfile",
    "frontend\Dockerfile",
    "scripts\init-mongo.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Print-Status "$file exists" $true
    } else {
        Print-Status "$file is missing" $false
    }
}

# Check if .dockerignore files exist
if (Test-Path "backend\.dockerignore") {
    Print-Status "Backend .dockerignore exists" $true
} else {
    Print-Warning "Backend .dockerignore is missing (recommended)"
}

if (Test-Path "frontend\.dockerignore") {
    Print-Status "Frontend .dockerignore exists" $true
} else {
    Print-Status "Frontend .dockerignore exists" $true
}

Write-Host ""
Write-Host "Validating Docker Compose configuration..." -ForegroundColor White

# Validate docker-compose.yml syntax
try {
    docker-compose -f docker-compose.yml config | Out-Null
    Print-Status "docker-compose.yml syntax is valid" $true
} catch {
    Print-Status "docker-compose.yml has syntax errors" $false
}

# Validate docker-compose-with-ollama.yml syntax
try {
    docker-compose -f docker-compose-with-ollama.yml config | Out-Null
    Print-Status "docker-compose-with-ollama.yml syntax is valid" $true
} catch {
    Print-Status "docker-compose-with-ollama.yml has syntax errors" $false
}

# Check if production config exists and validate it
if (Test-Path "docker-compose.prod.yml") {
    try {
        docker-compose -f docker-compose.prod.yml config | Out-Null
        Print-Status "docker-compose.prod.yml syntax is valid" $true
    } catch {
        Print-Status "docker-compose.prod.yml has syntax errors" $false
    }
}

Write-Host ""
Write-Host "Checking Docker build context..." -ForegroundColor White

# Check if package.json files exist
if (Test-Path "backend\package.json") {
    Print-Status "Backend package.json exists" $true
} else {
    Print-Status "Backend package.json is missing" $false
}

if (Test-Path "frontend\package.json") {
    Print-Status "Frontend package.json exists" $true
} else {
    Print-Status "Frontend package.json is missing" $false
}

# Check if nginx.conf exists for frontend
if (Test-Path "frontend\nginx.conf") {
    Print-Status "Frontend nginx.conf exists" $true
} else {
    Print-Status "Frontend nginx.conf is missing" $false
}

# Check if healthcheck.js exists for backend
if (Test-Path "backend\healthcheck.js") {
    Print-Status "Backend healthcheck.js exists" $true
} else {
    Print-Status "Backend healthcheck.js is missing" $false
}

Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor White

# Check if environment template exists
if (Test-Path ".env.docker.template") {
    Print-Status "Environment template exists" $true
} else {
    Print-Warning "Environment template is missing (optional)"
}

# Check for common environment issues
$composeContent = Get-Content "docker-compose.yml" -Raw -ErrorAction SilentlyContinue
if ($composeContent -and $composeContent.Contains("localhost")) {
    Print-Warning "docker-compose.yml contains 'localhost' references - check service communication"
}

Write-Host ""
Write-Host "Checking system resources..." -ForegroundColor White

# Check available disk space (at least 10GB recommended)
try {
    $drive = Get-PSDrive -Name (Get-Location).Drive.Name
    $freeSpaceGB = [math]::Round($drive.Free / 1GB, 2)
    if ($freeSpaceGB -gt 10) {
        Print-Status "Sufficient disk space available ($freeSpaceGB GB)" $true
    } else {
        Print-Warning "Less than 10GB disk space available ($freeSpaceGB GB)"
    }
} catch {
    Print-Warning "Could not check available disk space"
}

# Check available memory (at least 4GB recommended)
try {
    $totalMemoryGB = [math]::Round((Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
    if ($totalMemoryGB -gt 4) {
        Print-Status "Sufficient memory available ($totalMemoryGB GB)" $true
    } else {
        Print-Warning "Less than 4GB memory available ($totalMemoryGB GB)"
    }
} catch {
    Print-Warning "Could not check available memory"
}

Write-Host ""
Write-Host "Checking network ports..." -ForegroundColor White

# Function to check if port is in use
function Test-Port {
    param(
        [int]$Port,
        [string]$Service
    )
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Print-Warning "Port $Port is already in use (needed for $Service)"
        } else {
            Print-Status "Port $Port is available for $Service" $true
        }
    } catch {
        # Fallback method using netstat
        try {
            $netstat = netstat -an | Select-String ":$Port "
            if ($netstat) {
                Print-Warning "Port $Port is already in use (needed for $Service)"
            } else {
                Print-Status "Port $Port is available for $Service" $true
            }
        } catch {
            Print-Warning "Cannot check if port $Port is available"
        }
    }
}

# Check required ports
Test-Port -Port 3000 -Service "Frontend"
Test-Port -Port 3001 -Service "Backend"
Test-Port -Port 27017 -Service "MongoDB"
Test-Port -Port 8081 -Service "Mongo Express"
Test-Port -Port 11434 -Service "Ollama"

Write-Host ""
Write-Host "🏁 Validation Summary:" -ForegroundColor Cyan

if ($ValidationPassed) {
    Write-Host "✅ All critical validations passed!" -ForegroundColor Green
    Write-Host "🚀 Your Docker setup is ready to run." -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the services, run:" -ForegroundColor White
    Write-Host "  .\docker-setup.ps1" -ForegroundColor Yellow
    Write-Host "  or" -ForegroundColor White
    Write-Host "  docker-compose up -d --build" -ForegroundColor Yellow
} else {
    Write-Host "❌ Some validations failed." -ForegroundColor Red
    Write-Host "🔧 Please fix the issues above before running Docker setup." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "For detailed setup instructions, see: DOCKER_GUIDE.md" -ForegroundColor Cyan
