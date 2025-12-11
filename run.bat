@echo off
REM Windows batch script to setup and run backend

echo ========================================
echo Kannamma Backend Setup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Check if .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from example...
        copy .env.example .env
    ) else (
        echo Creating default .env file...
        echo DATABASE_URL=sqlite:///kannamma.db > .env
        echo SECRET_KEY=dev-secret-key-change-in-production >> .env
        echo JWT_SECRET_KEY=dev-jwt-secret-key >> .env
        echo FRONTEND_URL=http://localhost:5173 >> .env
    )
    echo.
    echo ⚠️  Please edit .env file with your configuration!
    echo.
    pause
)

REM Initialize database
echo Initializing database...
python setup.py
echo.

REM Start server
echo ========================================
echo Starting Flask server...
echo ========================================
echo.
python app.py

pause

