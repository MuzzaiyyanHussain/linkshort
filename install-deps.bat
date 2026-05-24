@echo off
echo 🚀 Installing Clerk dependencies...

REM Navigate to project directory
cd /d "%~dp0"

REM Clean install
echo Cleaning old node_modules...
if exist node_modules (
    rmdir /s /q node_modules
)

REM Install dependencies
echo Installing npm packages...
call npm install

echo.
echo ✅ Installation complete! 
echo Run: npm run dev
pause
