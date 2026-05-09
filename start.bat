@echo off
title ProLink Football Server

echo ==========================================
echo Starting ProLink Football System (Java Backend)
echo ==========================================

echo [1/3] Checking Node.js Dependencies...
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
)

echo [2/3] Compiling Core Java Backend...
if not exist "backend\out" mkdir backend\out
javac -d backend\out backend\src\core\BackendServer.java
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend compilation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Launching Servers...
:: Launch Java Backend in a separate command window
start "ProLink Java Backend" cmd /c "title Java Backend && echo Running Core Java Backend on port 8080... && java -cp backend\out core.BackendServer && pause"

:: Start Vite Frontend in the current terminal window
echo Starting Vite React Server on port 3000...
call npm run dev

pause
