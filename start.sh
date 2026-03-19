#!/bin/sh

# Set the port for the frontend, defaulting to 3000 if not provided by Railway
export PORT=${PORT:-3000}
export HOSTNAME="0.0.0.0"
export NODE_ENV="production"

echo "Starting Backend Engine on port 8000..."
# Run backend in the background
cd /app/backend_engine && python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 &

echo "Starting Frontend on port $PORT..."
# Run frontend in the foreground
cd /app && node server.js
