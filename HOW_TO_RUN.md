# How to Run the Backend

## ✅ Quick Start (Recommended)

### Option 1: Use the Batch Script (Windows)

In PowerShell, run:
```powershell
cd backend
.\run.bat
```

**Note:** In PowerShell, you need `.\` before the script name!

### Option 2: Manual Start

```powershell
cd backend
python app.py
```

## 🔧 If You Get Errors

### Error: "ModuleNotFoundError"

**Solution:** Install dependencies:
```powershell
cd backend
python -m pip install -r requirements.txt
```

### Error: "run.bat: command not found"

**Solution:** Use `.\run.bat` instead of `run.bat` in PowerShell

### Error: SQLAlchemy AssertionError

**Solution:** This is usually a version compatibility issue. Try:
```powershell
python -m pip install --upgrade SQLAlchemy Flask-SQLAlchemy
```

## 📋 What the run.bat Script Does

1. Creates virtual environment (if needed)
2. Activates virtual environment
3. Installs all dependencies
4. Creates .env file (if needed)
5. Initializes database
6. Starts Flask server

## 🚀 After Flask Starts

You should see:
```
Running on http://0.0.0.0:5000
```

Then proceed with ngrok setup (see `NGROK_SETUP.md`)



