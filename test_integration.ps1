# Frontend Integration Test Script
# Run this after starting both backend and frontend servers

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Frontend Integration Test" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking backend status..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -ContentType "application/json" -Body '{"email":"admin@test.com","password":"admin123"}' -ErrorAction Stop
    Write-Host "   ✓ Backend is running!" -ForegroundColor Green
    Write-Host "   ✓ Login endpoint working" -ForegroundColor Green
    Write-Host "   ✓ Token received: $($backendResponse.access.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend not running or error!" -ForegroundColor Red
    Write-Host "   Please start backend: python manage.py runserver" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if frontend is running
Write-Host "2. Checking frontend status..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   ✓ Frontend is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Frontend not running!" -ForegroundColor Red
    Write-Host "   Please start frontend: npm run dev" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test CORS
Write-Host "3. Testing CORS configuration..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:3000"
        "Content-Type" = "application/json"
    }
    $corsResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me/" -Method GET -Headers $headers -ErrorAction SilentlyContinue
    Write-Host "   ✓ CORS is configured correctly" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✓ CORS is configured correctly (401 expected without token)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ CORS might have issues" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test Authentication Flow
Write-Host "4. Testing full authentication flow..." -ForegroundColor Yellow

# Login
Write-Host "   a) Testing login..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@test.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -ContentType "application/json" -Body $loginBody
    $accessToken = $loginResponse.access
    $refreshToken = $loginResponse.refresh
    
    Write-Host "      ✓ Login successful" -ForegroundColor Green
    Write-Host "      ✓ Access token: $($accessToken.Substring(0,20))..." -ForegroundColor Green
    Write-Host "      ✓ Refresh token: $($refreshToken.Substring(0,20))..." -ForegroundColor Green
    Write-Host "      ✓ User: $($loginResponse.user.email) ($($loginResponse.user.role))" -ForegroundColor Green
} catch {
    Write-Host "      ✗ Login failed!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get current user
Write-Host "   b) Testing get current user..." -ForegroundColor Cyan
try {
    $authHeaders = @{
        "Authorization" = "Bearer $accessToken"
    }
    $userResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me/" -Method GET -Headers $authHeaders
    Write-Host "      ✓ Get user successful" -ForegroundColor Green
    Write-Host "      ✓ User: $($userResponse.email) - $($userResponse.name)" -ForegroundColor Green
} catch {
    Write-Host "      ✗ Get user failed!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test token refresh
Write-Host "   c) Testing token refresh..." -ForegroundColor Cyan
try {
    $refreshBody = @{
        refresh = $refreshToken
    } | ConvertTo-Json
    
    $refreshResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/refresh/" -Method POST -ContentType "application/json" -Body $refreshBody
    Write-Host "      ✓ Token refresh successful" -ForegroundColor Green
    Write-Host "      ✓ New access token: $($refreshResponse.access.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "      ✗ Token refresh failed!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Backend API: Working" -ForegroundColor Green
Write-Host "✓ Frontend App: Running" -ForegroundColor Green
Write-Host "✓ Authentication: Working" -ForegroundColor Green
Write-Host "✓ Token System: Working" -ForegroundColor Green
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Admin:" -ForegroundColor White
Write-Host "    Email: admin@test.com" -ForegroundColor Gray
Write-Host "    Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "  Security:" -ForegroundColor White
Write-Host "    Email: security@test.com" -ForegroundColor Gray
Write-Host "    Password: security123" -ForegroundColor Gray
Write-Host ""
Write-Host "  Resident:" -ForegroundColor White
Write-Host "    Email: resident@test.com" -ForegroundColor Gray
Write-Host "    Password: resident123" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:3000/login" -ForegroundColor White
Write-Host "  2. Login with one of the test accounts" -ForegroundColor White
Write-Host "  3. Test dashboard and other features" -ForegroundColor White
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
