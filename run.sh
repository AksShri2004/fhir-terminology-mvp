#!/bin/bash

echo "🚀 Starting FHIR Terminology Microservice MVP"
echo "=============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $port is already in use"
        return 1
    fi
    return 0
}

# Check if ports are available
if ! check_port 8000; then
    echo "Please stop the service using port 8000 and try again"
    exit 1
fi

if ! check_port 3000; then
    echo "Please stop the service using port 3000 and try again"
    exit 1
fi

echo "✅ Ports 8000 and 3000 are available"
echo ""

# Start backend
echo "🔧 Setting up backend..."
cd backend

# Install Python dependencies
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "🚀 Starting backend server on http://localhost:8000"
python -m uvicorn app:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if ! curl -f http://localhost:8000/ >/dev/null 2>&1; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend is running at http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""

# Start frontend
echo "🔧 Setting up frontend..."
cd ../frontend

# Install Node.js dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

echo "🚀 Starting frontend server on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if ! curl -f http://localhost:3000/ >/dev/null 2>&1; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 FHIR Terminology Microservice is ready!"
echo "=========================================="
echo ""
echo "🌐 Frontend Application: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "🎯 DEMO READY - Follow the demo script in demo-script.txt"
echo ""
echo "📋 Quick Test Commands:"
echo "curl http://localhost:8000/v1/terminology/autocomplete?q=fever"
echo "curl http://localhost:8000/fhir/CodeSystem/namaste"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
