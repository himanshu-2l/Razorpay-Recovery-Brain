# Revenue Recovery Brain — One-Click Dev Launcher
# Razorpay AI Buildathon 2026 — Track 03
$Host.UI.RawUI.WindowTitle = "Revenue Recovery Brain — Dev Launcher"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT = Split-Path -Parent $SCRIPT_DIR

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Razorpay Revenue Recovery Brain" -ForegroundColor White
Write-Host "  AI Buildathon 2026 — Track 03" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Start FastAPI backend
Write-Host "[1/2] Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ROOT\backend'; Write-Host 'Backend starting...' -ForegroundColor Yellow; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"
) -PassThru

Write-Host "  Backend PID: $($backendJob.Id)" -ForegroundColor Gray

# Wait for backend to boot
Write-Host "  Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Health check the backend
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get -TimeoutSec 5
    Write-Host "  Backend: READY ($($health.status))" -ForegroundColor Green
} catch {
    Write-Host "  Backend: Starting (may take a moment)..." -ForegroundColor Yellow
}

# Start Vite frontend
Write-Host ""
Write-Host "[2/2] Starting Vite Frontend on port 5173..." -ForegroundColor Yellow
$frontendJob = Start-Process -FilePath "powershell" -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ROOT\frontend'; Write-Host 'Frontend starting...' -ForegroundColor Yellow; bun run dev"
) -PassThru

Write-Host "  Dashboard PID: $($frontendJob.Id)" -ForegroundColor Gray

# Wait for frontend
Start-Sleep -Seconds 4

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  All services running!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Dashboard:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs:    http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

# Open browser
$open = Read-Host "Open dashboard in browser? (y/n)"
if ($open -eq "y" -or $open -eq "Y" -or $open -eq "") {
    Start-Process "http://localhost:5173"
}

Write-Host ""
Write-Host "Servers running. Close the backend/dashboard windows to stop." -ForegroundColor Gray
Write-Host "Press Enter to exit this launcher..." -ForegroundColor Gray
Read-Host
