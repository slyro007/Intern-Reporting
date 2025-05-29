# Test n8n webhooks after import
Write-Host "Testing n8n webhooks..." -ForegroundColor Green

# Test 1: Log receiver
Write-Host "`n1. Testing Log Receiver..." -ForegroundColor Yellow
$response1 = try {
    curl -X POST http://localhost:5678/webhook/intern-logs -H "Content-Type: application/json" -d '{"test": "data"}' 2>$null
} catch {
    "FAILED: $_"
}
Write-Host "Response: $response1"

# Test 2: Weekly Summary Generator  
Write-Host "`n2. Testing Weekly Summary Generator..." -ForegroundColor Yellow
$response2 = try {
    curl -X POST http://localhost:5678/webhook/generate-weekly-summary -H "Content-Type: application/json" -d '{}' 2>$null
} catch {
    "FAILED: $_"
}
Write-Host "Response: $response2"

# Test 3: Final Report Generator
Write-Host "`n3. Testing Final Report Generator..." -ForegroundColor Yellow  
$response3 = try {
    curl -X POST http://localhost:5678/webhook/generate-final-report -H "Content-Type: application/json" -d '{"userEmail": "srujan@wolfflogics.com"}' 2>$null
} catch {
    "FAILED: $_"
}
Write-Host "Response: $response3"

Write-Host "`nIf any show 404 errors, the workflows need to be imported and activated." -ForegroundColor Red
Write-Host "If any show credential errors, OpenAI credentials need to be configured." -ForegroundColor Red
Write-Host "If responses show success, everything is working!" -ForegroundColor Green 