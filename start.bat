@echo off
title MiraBot
cd /d "%~dp0"

if not exist ".env" (
  echo Missing .env file.
  echo Copy .env.example to .env and add your Discord bot token.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies for the first run...
  call npm install
  if errorlevel 1 (
    echo npm install failed. Check that Node.js is installed.
    pause
    exit /b 1
  )
)

call npm start
pause
