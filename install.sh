#!/bin/bash

# ELT Dashboard MVP Installation Script
echo "🚀 Installing ELT Dashboard MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f package.json ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating backend environment file..."
    cp env.example .env
    echo "✅ Environment file created. You may need to edit .env for your specific configuration."
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if [ ! -f package.json ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
cd ../backend
mkdir -p uploads data

# Set permissions
chmod 755 uploads
chmod 755 data

echo "✅ Installation completed successfully!"
echo ""
echo "🎉 ELT Dashboard MVP is ready to use!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "📊 Sample data is available in:"
echo "   sample-data.csv"
echo ""
echo "📚 Documentation:"
echo "   README.md - Main documentation"
echo "   backend/README.md - Backend documentation"
echo "   frontend/README.md - Frontend documentation"
echo ""
echo "🆘 Need help? Check the documentation or create an issue in the repository."
