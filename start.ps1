Write-Host "🚀 Starting Wolff Logics Intern Tracking System..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "📝 Please edit .env file with your OpenAI API key and other settings." -ForegroundColor Yellow
    Write-Host "   Then run this script again."
    exit 1
}

# Start services
Write-Host "🐳 Starting Docker services..." -ForegroundColor Blue
docker-compose up -d

# Wait a moment for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ System started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend (Intern Form): http://localhost:3000"
Write-Host "   n8n (Backend):          http://localhost:5678"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:5678 to set up n8n"
Write-Host "   2. Import workflows from n8n-workflows/ directory"
Write-Host "   3. Configure OpenAI API credentials in n8n"
Write-Host "   4. Test the form at http://localhost:3000"
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Magenta
Write-Host "   View logs:    docker-compose logs -f"
Write-Host "   Stop system:  docker-compose down"
Write-Host "   Restart:      docker-compose restart" 