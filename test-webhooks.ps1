# Test Webhook Endpoints for Intern Tracking System

Write-Host "🧪 Testing Intern Tracking System Webhooks..." -ForegroundColor Cyan
Write-Host ""

# Test data
$loginData = @{
    email = "srujan@wolfflogics.com"
    password = "password123"
} | ConvertTo-Json

$logData = @{
    intern_name = "Srujan Jalagam"
    intern_email = "srujan@wolfflogics.com" 
    log_entry = "Completed setup of 3 workstations using Immy.bot. Configured Windows 11, joined to domain, installed standard software package."
    date = (Get-Date -Format "yyyy-MM-dd")
    time = (Get-Date -Format "HH:mm:ss")
} | ConvertTo-Json

# Test endpoints
$endpoints = @(
    @{
        name = "Auth Login"
        url = "http://localhost:5678/webhook/auth-login"
        data = $loginData
        description = "Test user authentication"
    },
    @{
        name = "Log Entry"
        url = "http://localhost:5678/webhook/intern-logs"
        data = $logData
        description = "Submit daily log entry"
    }
)

foreach ($endpoint in $endpoints) {
    Write-Host "📡 Testing: $($endpoint.name)" -ForegroundColor Yellow
    Write-Host "   Description: $($endpoint.description)" -ForegroundColor Gray
    Write-Host "   URL: $($endpoint.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint.url -Method POST -Body $endpoint.data -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ Success!" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
    catch {
        Write-Host "   ❌ Failed!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "🔧 Instructions:" -ForegroundColor Cyan
Write-Host "1. Make sure n8n is running: docker-compose ps" -ForegroundColor White
Write-Host "2. Check n8n workflows are active: http://localhost:5678" -ForegroundColor White
Write-Host "3. If webhooks fail, activate workflows in n8n interface" -ForegroundColor White
Write-Host "4. Test individual endpoints with: npm run test-api" -ForegroundColor White

Write-Host ""
Write-Host "📋 Available Test Users:" -ForegroundColor Cyan
Write-Host "• srujan@wolfflogics.com / password123 (intern)" -ForegroundColor White
Write-Host "• admin@wolfflogics.com / admin123 (admin)" -ForegroundColor White
Write-Host "• demo@wolfflogics.com / demo123 (intern)" -ForegroundColor White 