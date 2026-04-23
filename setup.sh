#!/bin/bash
# Quick Setup Script for Vibe Meeting MVP

echo "🚀 Vibe Meeting - Quick Setup"
echo "=============================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js..."
node_version=$(node -v)
echo "  Node.js version: $node_version"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd server
echo "  Installing dependencies..."
npm install --silent
echo "  ✓ Backend dependencies installed"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../client
echo "  Installing dependencies..."
npm install --silent
echo "  ✓ Frontend dependencies installed"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "🎬 Next Steps:"
echo ""
echo "Terminal 1 - Start Backend:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Start Frontend:"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Test with multiple browser windows or devices! 🎉"
