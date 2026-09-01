@echo off
echo ===================================================
echo   Razorpay Revenue Recovery Brain - Quick Launcher
echo   Track 03 - AI Revenue Recovery (Buildathon 2026)
echo ===================================================
echo.

echo Starting FastAPI Backend on http://localhost:8000 ...
start "Recovery Brain Backend (FastAPI)" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Agent Studio Frontend on http://localhost:5173 ...
start "Recovery Brain Dashboard (Vite)" cmd /k "cd dashboard && bun run dev"

echo.
echo ===================================================
echo   Systems Initialized!
echo   Dashboard: http://localhost:5173
echo   API Docs:  http://localhost:8000/docs
echo ===================================================
