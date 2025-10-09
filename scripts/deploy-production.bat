@echo off
REM 🚀 Production Deployment Script for Windows
REM Invoice Management System

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          🚀 Invoice Management System Deployment           ║
echo ║                     Production Ready                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check deployment type
if "%1"=="" (
    set /p DEPLOYMENT_TYPE="Enter deployment type (docker/vercel/railway/cpanel): "
) else (
    set DEPLOYMENT_TYPE=%1
)

echo Deployment type: %DEPLOYMENT_TYPE%
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

echo [INFO] Node.js and npm are installed
echo.

REM Check environment file
if not exist ".env.production" (
    if not exist ".env.local" (
        echo [WARNING] No .env.production or .env.local file found
        if exist ".env.example" (
            echo [INFO] Creating .env.production from template...
            copy ".env.example" ".env.production" >nul
            echo [WARNING] Please edit .env.production with your production values
            pause
        ) else (
            echo [ERROR] No .env.example template found
            pause
            exit /b 1
        )
    ) else (
        echo [WARNING] Using .env.local (consider creating .env.production)
    )
)

REM Install dependencies
echo [STEP] Installing dependencies...
npm ci --only=production
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Generate Prisma client
echo [STEP] Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)

REM Build application
echo [STEP] Building application...
set NODE_ENV=production
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [SUCCESS] Build completed successfully
echo.

REM Deploy based on type
if /i "%DEPLOYMENT_TYPE%"=="docker" (
    echo [STEP] Preparing Docker deployment...
    if not exist "Dockerfile" (
        echo [ERROR] Dockerfile not found
        pause
        exit /b 1
    )
    if not exist "docker-compose.yml" (
        echo [ERROR] docker-compose.yml not found
        pause
        exit /b 1
    )
    
    echo [INFO] Building Docker image...
    docker build -t invoice-management-system .
    if %errorlevel% neq 0 (
        echo [ERROR] Docker build failed
        pause
        exit /b 1
    )
    
    echo [INFO] Starting services with docker-compose...
    docker-compose up -d
    
    echo [SUCCESS] Docker deployment completed
    echo [INFO] Application is running at http://localhost:3000
    
) else if /i "%DEPLOYMENT_TYPE%"=="vercel" (
    echo [STEP] Preparing Vercel deployment...
    
    where vercel >nul 2>nul
    if %errorlevel% neq 0 (
        echo [INFO] Installing Vercel CLI...
        npm install -g vercel
    )
    
    echo [INFO] Deploying to Vercel...
    vercel --prod
    
    echo [SUCCESS] Vercel deployment completed
    
) else if /i "%DEPLOYMENT_TYPE%"=="railway" (
    echo [STEP] Preparing Railway deployment...
    
    where railway >nul 2>nul
    if %errorlevel% neq 0 (
        echo [INFO] Installing Railway CLI...
        npm install -g @railway/cli
    )
    
    echo [INFO] Logging in to Railway...
    railway login
    
    echo [INFO] Deploying to Railway...
    railway up
    
    echo [SUCCESS] Railway deployment completed
    
) else if /i "%DEPLOYMENT_TYPE%"=="cpanel" (
    echo [STEP] Preparing cPanel deployment...
    
    REM Create deployment package
    set TEMP_DIR=%TEMP%\invoice-app-deploy-%date:~10,4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
    set TEMP_DIR=%TEMP_DIR: =0%
    
    mkdir "%TEMP_DIR%" 2>nul
    
    echo [INFO] Creating deployment package...
    
    REM Copy files (excluding certain directories)
    xcopy /E /I /Q src "%TEMP_DIR%\src" >nul
    xcopy /E /I /Q prisma "%TEMP_DIR%\prisma" >nul
    xcopy /E /I /Q public "%TEMP_DIR%\public" >nul
    copy package.json "%TEMP_DIR%\" >nul
    copy server.js "%TEMP_DIR%\" >nul
    copy next.config.ts "%TEMP_DIR%\" >nul
    copy .env.production "%TEMP_DIR%\" >nul 2>nul
    copy tailwind.config.ts "%TEMP_DIR%\" >nul
    copy tsconfig.json "%TEMP_DIR%\" >nul
    
    REM Create deployment instructions
    echo # cPanel Deployment Instructions > "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo. >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo ## 1. Upload Files >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo Upload all files in this directory to your cPanel hosting account. >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo. >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo ## 2. Setup Node.js App >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo 1. Login to cPanel >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo 2. Go to "Setup Node.js App" >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo 3. Create Application with: >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo    - Application Root: invoice-app >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo    - Application URL: yourdomain.com >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo    - Application Startup File: server.js >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo    - Node.js Version: 18.x or higher >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo. >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo ## 3. Install Dependencies >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo Run in cPanel Terminal: >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo ```bash >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo cd invoice-app >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo npm install --production >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo ``` >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo. >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo ## 4. Setup Environment Variables >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo Configure environment variables in cPanel Node.js App settings. >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo. >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo ## 5. Start Application >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    echo Click "Restart" in cPanel Node.js App >> "%TEMP_DIR%\DEPLOYMENT_INSTRUCTIONS.md"
    
    REM Create zip file
    set ZIP_FILE=invoice-app-cpanel-%date:~10,4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.zip
    set ZIP_FILE=%ZIP_FILE: =0%
    
    powershell -command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%ZIP_FILE%'"
    
    echo [SUCCESS] Deployment package created: %ZIP_FILE%
    echo [INFO] Upload this file to your cPanel hosting and follow DEPLOYMENT_INSTRUCTIONS.md
    
    REM Cleanup
    rmdir /S /Q "%TEMP_DIR%" 2>nul
    
) else (
    echo [ERROR] Invalid deployment type: %DEPLOYMENT_TYPE%
    echo [INFO] Usage: deploy-production.bat [docker^|vercel^|railway^|cpanel]
    pause
    exit /b 1
)

echo.
echo [SUCCESS] 🎉 Deployment completed successfully!
echo.
echo Thank you for using Invoice Management System! 🚀
echo.
pause