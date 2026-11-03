@echo off
chcp 65001 > nul
cd /d "%~dp0"
title RR Computers - E Sevai Maiyam ^| Govt Authorized e-Seva ^& CSC
cls
echo ========================================================
echo   RR Computers - E Sevai Maiyam ^| Govt Authorized e-Seva ^& CSC
echo   Starting local server at: http://localhost:8081
echo   Opening default browser automatically...
echo ========================================================
echo.
echo   If browser does not open automatically, click here:
echo   --^> http://localhost:8081
echo.
echo ========================================================

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start "" "http://localhost:8081"
    node server.js
) else (
    echo [!] Node.js not detected in PATH, falling back to Python...
    start "" "http://localhost:8081"
    python -m http.server 8081
)
pause
