@echo off
REM Quick Start Script for Windows - Customer Analysis Feature
REM Run this in Command Prompt (not Git Bash)

echo ========================================
echo   E-Metric Hub - Quick Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.9+ from python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from nodejs.org
    pause
    exit /b 1
)

echo [1/3] Setting up Python AI Service...
cd ai_service

REM Install Python packages globally (no venv needed for quick start)
echo    Installing Python packages...
python -m pip install -q fastapi uvicorn torch transformers pydantic numpy safetensors python-multipart

REM Start Python API in background
echo    Starting Python API on port 8001...
start /B python api.py

cd ..
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Starting Backend...
cd backend
start /B npm run dev
cd ..
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend...
cd frontend  
start /B npm run dev
cd ..

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Python API:  http://localhost:8001
echo Backend:     http://localhost:5000
echo Frontend:    http://localhost:5173 or 5174
echo.
echo Customer Analysis Feature:
echo http://localhost:5173/customer-analysis
echo.
echo Press any key to open in browser...
pause >nul

start http://localhost:5173/customer-analysis

echo.
echo Services are running in background.
echo To stop: Close this window or run: taskkill /F /IM python.exe /IM node.exe
pause
