# Install Python Dependencies - Fix Flask Error

## Problem
You're seeing: `ModuleNotFoundError: No module named 'flask_jwt_extended'`

This means the required Python packages aren't installed.

## Solution: Install Dependencies

### Step 1: Open Terminal in Backend Folder

1. **Open Command Prompt or PowerShell**
2. **Navigate to backend folder:**
   ```cmd
   cd C:\Users\haris\OneDrive\Pictures\Desktop\kannama\backend
   ```

### Step 2: Activate Virtual Environment (if using one)

**If you have a virtual environment:**
```cmd
# Activate virtual environment
venv\Scripts\activate
```

**If you don't have a virtual environment, create one:**
```cmd
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate
```

### Step 3: Install All Dependencies

```cmd
pip install -r requirements.txt
```

This will install:
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- Flask-JWT-Extended
- python-dotenv
- SQLAlchemy
- twilio
- And all other required packages

### Step 4: Verify Installation

```cmd
python -c "import flask; import flask_jwt_extended; print('All packages installed!')"
```

If you see "All packages installed!" - you're good to go!

### Step 5: Start Flask Server

```cmd
python app.py
```

You should now see:
```
Running on http://0.0.0.0:5000
```

## Alternative: Install Packages One by One

If `pip install -r requirements.txt` doesn't work, install manually:

```cmd
pip install Flask==3.0.0
pip install Flask-SQLAlchemy==3.1.1
pip install Flask-CORS==4.0.0
pip install Flask-JWT-Extended==4.6.0
pip install python-dotenv==1.0.0
pip install SQLAlchemy==2.0.23
pip install Werkzeug==3.0.1
pip install requests==2.31.0
pip install twilio==8.10.0
pip install python-dateutil==2.8.2
```

## Troubleshooting

### Problem: "pip is not recognized"
**Solution:** 
- Make sure Python is installed
- Try: `python -m pip install -r requirements.txt`

### Problem: "Permission denied"
**Solution:**
- Run terminal as Administrator
- Or use: `pip install --user -r requirements.txt`

### Problem: "No module named 'venv'"
**Solution:**
- Install Python properly
- Or skip virtual environment and install globally

## After Installation

Once Flask starts successfully, you can proceed with ngrok setup!

See `NGROK_SETUP.md` for next steps.

