# PowerShell script to setup and run backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kannamma Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host ""
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Creating .env file from example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
    } else {
        Write-Host "Creating default .env file..." -ForegroundColor Yellow
        @"
DATABASE_URL=sqlite:///kannamma.db
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key
FRONTEND_URL=http://localhost:5173
"@ | Out-File -FilePath .env -Encoding utf8
    }
    Write-Host ""
    Write-Host "⚠️  Please edit .env file with your configuration!" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
python setup.py
Write-Host ""

# Start server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Flask server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
python app.py

Read-Host "Press Enter to exit"

