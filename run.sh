#!/bin/bash
# Unix/Linux/Mac script to setup and run backend

echo "========================================"
echo "Kannamma Backend Setup"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env file with your configuration!"
    echo ""
    read -p "Press enter to continue..."
fi

# Initialize database
echo "Initializing database..."
python setup.py
echo ""

# Start server
echo "========================================"
echo "Starting Flask server..."
echo "========================================"
echo ""
python app.py

