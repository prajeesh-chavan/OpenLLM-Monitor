# OpenLLM Monitor - Seed Data Generator
# PowerShell script to generate comprehensive seed data

Write-Host "🚀 OpenLLM Monitor - Seed Data Generator" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Change to scripts directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "📂 Working directory: $ScriptDir" -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install --silent
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌱 Starting seed data generation..." -ForegroundColor Cyan
Write-Host ""

# Run the seed script
try {
    node seed-data.js
    Write-Host ""
    Write-Host "🎉 Seed data generation completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Start your OpenLLM Monitor application" -ForegroundColor White
    Write-Host "   2. Open the dashboard in your browser" -ForegroundColor White
    Write-Host "   3. Explore the analytics and monitoring features" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Dashboard Features Now Available:" -ForegroundColor Cyan
    Write-Host "   • Real-time request monitoring" -ForegroundColor White
    Write-Host "   • Provider performance comparison" -ForegroundColor White
    Write-Host "   • Cost analysis and tracking" -ForegroundColor White
    Write-Host "   • Error rate monitoring" -ForegroundColor White
    Write-Host "   • Token usage analytics" -ForegroundColor White
    Write-Host "   • Historical trends and patterns" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Failed to generate seed data" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
