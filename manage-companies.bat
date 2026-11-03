@echo off
title Matisha Multi-Company Manager
echo ========================================================
echo   Matisha Multi-Company Manager
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python company_manager.py
) else (
    echo Python not found! Please install Python or add it to PATH.
    pause
)

