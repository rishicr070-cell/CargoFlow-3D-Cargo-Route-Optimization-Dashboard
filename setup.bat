@echo off
echo ==========================================
echo    CargoFlow - Installing Dependencies
echo ==========================================
echo.

:: Get the directory where the script is located
set "PROJECT_ROOT=%~dp0"

echo 1. Installing Backend Requirements...
cd /d "%PROJECT_ROOT%backend"
py -m pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo.
    echo [WARNING] "py" launcher not found. Trying "python" instead...
    python -m pip install -r requirements.txt
)

echo.
echo 2. Installing Frontend Requirements...
cd /d "%PROJECT_ROOT%frontend"
call npm install

echo.
echo ==========================================
echo    All dependencies installed successfully!
echo ==========================================
echo.
echo To run the project:
echo 1. Start backend: double-click backend\start_backend.bat
echo 2. Start frontend: double-click frontend\start_frontend.bat
echo ==========================================
pause
