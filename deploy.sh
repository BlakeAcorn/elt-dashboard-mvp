#!/bin/bash

# ELT Dashboard Deployment Script
echo "🚀 ELT Dashboard Deployment Helper"
echo "================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo "✅ Git repository initialized"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Create a GitHub repository"
    echo "2. Run: git remote add origin https://github.com/yourusername/elt-dashboard-mvp.git"
    echo "3. Run: git push -u origin main"
    echo ""
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "🌐 Deployment Options:"
echo "1. Vercel (Frontend) + Railway (Backend) - Recommended"
echo "2. Netlify (Frontend) + Railway (Backend)"
echo "3. DigitalOcean App Platform (Full-stack)"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔧 Quick Commands:"
echo "- Build frontend: cd frontend && npm run build"
echo "- Test backend: cd backend && npm start"
echo "- Check logs: Check your hosting platform's logs"
