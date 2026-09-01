@echo off
title Revenue Recovery Brain — Local Dev Server
echo.
echo ==========================================
echo   Razorpay Revenue Recovery Brain
echo   AI Buildathon 2026 — Track 03
echo ==========================================
echo.

:: Start FastAPI backend in a new window
echo [1/2] Starting FastAPI backend on port 8000...
start "RRB Backend (Port 8000)" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"

:: Wait 3 seconds for backend to spin up
ping -n 4 127.0.0.1 > nul

:: Start Vite frontend in a new window
echo [2/2] Starting Vite dashboard on port 5173...
start "RRB Dashboard (Port 5173)" cmd /k "cd /d %~dp0dashboard && bun run dev"

echo.
echo Both servers are starting in separate windows.
echo.
echo   Backend API:   http://localhost:8000
echo   Dashboard:     http://localhost:5173
echo   API Docs:      http://localhost:8000/docs
echo.
echo Press any key to open the dashboard in your browser...
pause > nul
start "" "http://localhost:5173"
