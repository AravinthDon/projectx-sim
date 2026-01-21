@echo off
REM Production Start Script for ProjectX-Sim
REM This script builds and starts the server in production mode
REM Can be run from any directory

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
REM Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

echo.
echo 🔨 Building ProjectX-Sim for production...
echo 📂 Working directory: %SCRIPT_DIR%
echo.

REM Clean previous build
if exist "dist" (
    echo 📁 Cleaning previous build...
    rmdir /s /q dist
)

REM Build TypeScript to JavaScript
echo 🔧 Compiling TypeScript...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    exit /b 1
)

echo.
echo ✅ Build complete!
echo.
echo 🚀 Starting server in production mode...
echo    Mode: relaxed
echo    Host: localhost
echo    Port: 8080
echo.

REM Start server with environment variables
set HOST=localhost
set AUTH_MODE=relaxed
node dist/index.js
