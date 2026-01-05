#!/bin/bash

# Setup script for NapCat QQ Bot

echo "Setting up NapCat QQ Bot environment..."

# 1. Create Python Virtual Environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
else
    echo "Virtual environment already exists."
fi

# 2. Install Python Dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    pip install bilibili-api-python aiohttp
fi
deactivate

# 3. Install Node.js Dependencies
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "package.json not found!"
    exit 1
fi

echo "Setup complete!"
echo "Initializing configuration files..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env from example."
fi

if [ ! -f "config.json" ]; then
    cp config.json.example config.json
    echo "Created config.json from example."
fi

echo "To start the bot:"
echo "1. Configure .env file (Connection & AI settings)"
echo "2. Configure config.json (Blacklist & Groups)"
echo "3. Run: npm start"

