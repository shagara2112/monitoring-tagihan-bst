#!/bin/bash

# Deployment Script for Invoice Management System
# This script helps deploy to various platforms

echo "🚀 Invoice Management System Deployment Script"
echo "============================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to display menu
show_menu() {
    echo ""
    echo "Select deployment platform:"
    echo "1) Vercel (Recommended)"
    echo "2) Netlify"
    echo "3) Railway"
    echo "4) DigitalOcean App Platform"
    echo "5) Build for Production Only"
    echo "6) Exit"
    echo ""
}

# Function to deploy to Vercel
deploy_vercel() {
    echo ""
    echo "🌐 Deploying to Vercel..."
    echo "======================="
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        echo "🔐 Please login to Vercel:"
        vercel login
    fi
    
    # Deploy
    echo "📦 Deploying to Vercel..."
    vercel --prod
    
    echo ""
    echo "✅ Deployment to Vercel completed!"
    echo "📝 Don't forget to configure environment variables in Vercel dashboard:"
    echo "   - DATABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - JWT_SECRET"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo ""
    echo "🌐 Deploying to Netlify..."
    echo "======================"
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo "❌ Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    # Check if logged in
    if ! netlify status &> /dev/null; then
        echo "🔐 Please login to Netlify:"
        netlify login
    fi
    
    # Build the application
    echo "📦 Building application..."
    npm run build
    
    # Deploy
    echo "📦 Deploying to Netlify..."
    netlify deploy --prod --dir=.next
    
    echo ""
    echo "✅ Deployment to Netlify completed!"
    echo "📝 Don't forget to configure environment variables in Netlify dashboard."
}

# Function to deploy to Railway
deploy_railway() {
    echo ""
    echo "🚂 Deploying to Railway..."
    echo "======================="
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Check if logged in
    if ! railway whoami &> /dev/null; then
        echo "🔐 Please login to Railway:"
        railway login
    fi
    
    # Initialize project if not already
    if [ ! -f "railway.json" ]; then
        echo "📦 Initializing Railway project..."
        railway init
    fi
    
    # Deploy
    echo "📦 Deploying to Railway..."
    railway up
    
    echo ""
    echo "✅ Deployment to Railway completed!"
    echo "📝 Don't forget to configure environment variables in Railway dashboard."
}

# Function to deploy to DigitalOcean
deploy_digitalocean() {
    echo ""
    echo "🌊 Deploying to DigitalOcean App Platform..."
    echo "==========================================="
    
    echo "📝 Manual deployment required for DigitalOcean App Platform:"
    echo "1. Go to https://cloud.digitalocean.com/apps"
    echo "2. Click 'Create App'"
    echo "3. Connect your GitHub repository"
    echo "4. Configure build settings:"
    echo "   - Build Command: npm run build"
    echo "   - Run Command: npm start"
    echo "   - Output Directory: .next"
    echo "5. Add environment variables"
    echo "6. Deploy!"
    
    echo ""
    echo "📦 Building application for testing..."
    npm run build
    
    echo ""
    echo "✅ Build completed! Follow the instructions above to deploy to DigitalOcean."
}

# Function to build for production only
build_production() {
    echo ""
    echo "📦 Building for Production..."
    echo "==========================="
    
    # Clean previous build
    echo "🧹 Cleaning previous build..."
    rm -rf .next
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm ci
    
    # Build
    echo "🔨 Building application..."
    npm run build
    
    # Test build
    echo "🧪 Testing build..."
    npm start &
    PID=$!
    sleep 5
    kill $PID
    
    echo ""
    echo "✅ Production build completed!"
    echo "📍 Build files are in the .next directory"
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            deploy_vercel
            ;;
        2)
            deploy_netlify
            ;;
        3)
            deploy_railway
            ;;
        4)
            deploy_digitalocean
            ;;
        5)
            build_production
            ;;
        6)
            echo "👋 Exiting..."
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please select a number between 1 and 6."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done