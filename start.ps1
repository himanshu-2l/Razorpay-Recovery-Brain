# Razorpay Revenue Recovery Brain - PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Razorpay Revenue Recovery Brain - Quick Launcher" -ForegroundColor White
Write-Host "  Track 03 - AI Revenue Recovery (Buildathon 2026)" -ForegroundColor DarkCyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

Write-Host "Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$rootPath\backend'; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting Agent Studio Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$rootPath\dashboard'; bun run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Systems Initialized!" -ForegroundColor Green
Write-Host "  Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan
