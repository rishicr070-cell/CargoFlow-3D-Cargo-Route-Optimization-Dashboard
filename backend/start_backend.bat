@echo off
echo ==========================================
echo   CargoFlow - Starting Backend
echo ==========================================
cd /d "%~dp0"
pip install -r requirements.txt --quiet
echo.
echo Starting FastAPI at http://localhost:8000
echo API docs at     http://localhost:8000/docs
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
