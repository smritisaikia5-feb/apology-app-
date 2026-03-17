# Local dev startup script for Windows
# Starts both the API server and the Vite frontend

# Set environment variables
$env:PORT = "3001"
$env:NODE_ENV = "development"

# Start API server in background
$apiJob = Start-Job -ScriptBlock {
    Set-Location "d:\Gili-Apology\Animated-Pet-Showcase\artifacts\api-server"
    $env:PORT = "3001"
    $env:NODE_ENV = "development"
    npx tsx ./src/index.ts
}

Write-Host "API server starting on port 3001..." -ForegroundColor Cyan

# Give API server a moment to start
Start-Sleep -Seconds 2

# Now start the frontend with its own PORT and BASE_PATH
$env:PORT = "5173"
$env:BASE_PATH = "/"
$env:NODE_ENV = "development"

Write-Host "Starting frontend dev server on port 5173..." -ForegroundColor Green

Set-Location "d:\Gili-Apology\Animated-Pet-Showcase\artifacts\apology-site"
npx vite --config vite.config.ts --host 0.0.0.0
