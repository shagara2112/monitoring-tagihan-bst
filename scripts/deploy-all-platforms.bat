@echo off
REM Deployment Script for Invoice Management System (Windows)
REM This script helps deploy to various platforms

echo.
echo 🚀 Invoice Management System Deployment Script
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

:menu
echo.
echo Select deployment platform:
echo 1) Vercel (Recommended)
echo 2) Netlify
echo 3) Railway
echo 4) DigitalOcean App Platform
echo 5) Build for Production Only
echo 6) Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto deploy_vercel
if "%choice%"=="2" goto deploy_netlify
if "%choice%"=="3" goto deploy_railway
if "%choice%"=="4" goto deploy_digitalocean
if "%choice%"=="5" goto build_production
if "%choice%"=="6" goto exit

echo.
echo ❌ Invalid choice. Please select a number between 1 and 6.
goto menu

:deploy_vercel
echo.
echo 🌐 Deploying to Vercel...
echo =======================
echo.

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if logged in
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Vercel:
    vercel login
)

REM Deploy
echo 📦 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment to Vercel completed!
echo 📝 Don't forget to configure environment variables in Vercel dashboard:
echo    - DATABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo    - SUPABASE_SERVICE_ROLE_KEY
echo    - JWT_SECRET
echo    - NEXTAUTH_SECRET
echo    - NEXTAUTH_URL
goto end

:deploy_netlify
echo.
echo 🌐 Deploying to Netlify...
echo ======================
echo.

REM Check if Netlify CLI is installed
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Netlify CLI not found. Installing...
    npm install -g netlify-cli
)

REM Check if logged in
netlify status >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Netlify:
    netlify login
)

REM Build the application
echo 📦 Building application...
npm run build

REM Deploy
echo 📦 Deploying to Netlify...
netlify deploy --prod --dir=.next

echo.
echo ✅ Deployment to Netlify completed!
echo 📝 Don't forget to configure environment variables in Netlify dashboard.
goto end

:deploy_railway
echo.
echo 🚂 Deploying to Railway...
echo =======================
echo.

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Check if logged in
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Railway:
    railway login
)

REM Initialize project if not already
if not exist "railway.json" (
    echo 📦 Initializing Railway project...
    railway init
)

REM Deploy
echo 📦 Deploying to Railway...
railway up

echo.
echo ✅ Deployment to Railway completed!
echo 📝 Don't forget to configure environment variables in Railway dashboard.
goto end

:deploy_digitalocean
echo.
echo 🌊 Deploying to DigitalOcean App Platform...
echo ===========================================
echo.
echo 📝 Manual deployment required for DigitalOcean App Platform:
echo 1. Go to https://cloud.digitalocean.com/apps
echo 2. Click 'Create App'
echo 3. Connect your GitHub repository
echo 4. Configure build settings:
echo    - Build Command: npm run build
echo    - Run Command: npm start
echo    - Output Directory: .next
echo 5. Add environment variables
echo 6. Deploy!
echo.

echo 📦 Building application for testing...
npm run build

echo.
echo ✅ Build completed! Follow the instructions above to deploy to DigitalOcean.
goto end

:build_production
echo.
echo 📦 Building for Production...
echo ===========================
echo.

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist ".next" rmdir /s /q ".next"

REM Install dependencies
echo 📦 Installing dependencies...
npm ci

REM Build
echo 🔨 Building application...
npm run build

echo.
echo ✅ Production build completed!
echo 📍 Build files are in the .next directory
goto end

:end
echo.
echo Press any key to return to the menu...
pause >nul
goto menu

:exit
echo.
echo 👋 Exiting...
pause
exit /b 0