@echo off
title A Block Canteen - Starter
echo ==============================================
echo   A Block Canteen  -  starting everything
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Please install it from https://nodejs.org  ^(choose LTS^), then double-click this file again.
  pause
  exit /b
)

echo Step 1/3: installing the back end  ^(first time only, wait a few minutes^)...
cd /d "%~dp0backend"
if not exist node_modules call npm install

echo Step 2/3: installing the website  ^(first time only^)...
cd /d "%~dp0frontend"
if not exist node_modules call npm install

echo Step 3/3: starting...
start "Canteen BACK END - keep this window open" /d "%~dp0backend" cmd /k npm start
timeout /t 6 >nul
start "Canteen WEBSITE - keep this window open" /d "%~dp0frontend" cmd /k npm run dev
timeout /t 8 >nul
start http://localhost:5173

echo.
echo Done. The website opens in your browser.
echo To stop everything, close the two black windows.
timeout /t 5 >nul
