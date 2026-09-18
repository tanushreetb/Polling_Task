@echo off
setlocal enabledelayedexpansion
title PulseVote Launcher

echo ============================================================
echo               PulseVote Application Launcher
echo        Real-Time Polling Engine with Go ^& React Vite
echo ============================================================
echo.

:: Detect root directory dynamically
set "SCRIPT_DIR=%~dp0"

if exist "%SCRIPT_DIR%pulsevote\backend" (
    set "PROJECT_ROOT=%SCRIPT_DIR%pulsevote"
) else if exist "%SCRIPT_DIR%backend" (
    set "PROJECT_ROOT=%SCRIPT_DIR%"
) else (
    echo [ERROR] Could not locate pulsevote backend and frontend folders!
    echo Please make sure this script is located in the project root.
    echo.
    pause
    exit /b 1
)

set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"

:: Configure Cloud Redis if not explicitly provided
if "%REDIS_ADDR%"=="" (
    set "REDIS_ADDR=rediss://default:gQAAAAAABFn8AAIgcDE0MWQ0OTdjNTkzMWI0MmViYWZiM2Q3MGU0NmRiY2I1NA@finer-pup-285180.upstash.io:6379"
)

:: Check Go prerequisite
echo [Checking Environment]
where go >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Go compiler was not found in your PATH!
    echo Please install Go 1.21+ from https://go.dev/dl/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%v in ('go version') do set "GO_VER=%%v"
    echo  [+] Go found: !GO_VER!
)

:: Check Node.js / npm prerequisite
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js / npm was not found in your PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"
    echo  [+] Node found: !NODE_VER!
)

echo.
:: Check frontend dependencies
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [Setup] Frontend node_modules not found. Running npm install...
    pushd "%FRONTEND_DIR%"
    call npm install
    popd
    echo [Setup] Dependencies installed successfully.
    echo.
)

:: Start Backend in its own window
echo [1/2] Starting Go Backend Server (Port 8080)...
if not exist "%BACKEND_DIR%\server.exe" (
    echo [Setup] Compiling backend server...
    pushd "%BACKEND_DIR%"
    go build -o server.exe ./cmd/server
    popd
)
start "PulseVote - Backend Server (Port 8080)" cmd /k "title PulseVote Backend && cd /d "%BACKEND_DIR%" && server.exe"

:: Small delay to let backend bind port
timeout /t 2 /nobreak >nul

:: Start Frontend in its own window
echo [2/2] Starting React Vite Frontend (Port 5173)...
start "PulseVote - Frontend UI (Port 5173)" cmd /k "title PulseVote Frontend && cd /d "%FRONTEND_DIR%" && npm run dev"

:: Give dev server a moment to start, then open browser
timeout /t 3 /nobreak >nul
echo.
echo [Opening Browser] Launching http://localhost:5173/ ...
start http://localhost:5173/

echo.
echo ============================================================
echo   PulseVote is now running!
echo ============================================================
echo   Frontend UI:        http://localhost:5173/
echo   Backend API:        http://localhost:8080/
echo   WebSocket Stream:   ws://localhost:8080/ws
echo   Health Check:       http://localhost:8080/api/health
echo ============================================================
echo.
echo NOTE: Two dedicated terminal windows have been opened for
echo       the Backend and Frontend processes.
echo       To stop the application, simply close those two windows.
echo.
pause
