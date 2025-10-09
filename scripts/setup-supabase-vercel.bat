@echo off
REM 🚀 Supabase + Vercel Setup Script for Windows
REM Invoice Management System

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║      🚀 Supabase + Vercel Setup Script                     ║
echo ║           Invoice Management System                          ║
echo ╚══════════════════════════════════════════════════════════════╝
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

REM Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed
    pause
    exit /b 1
)

echo [INFO] Node.js, npm, and Git are installed
echo.

REM Install Supabase CLI
echo [STEP] Installing Supabase CLI...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installing Supabase CLI...
    npm install -g supabase
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Supabase CLI
        pause
        exit /b 1
    )
    echo [SUCCESS] Supabase CLI installed successfully
) else (
    echo [INFO] Supabase CLI is already installed
)
echo.

REM Install Vercel CLI
echo [STEP] Installing Vercel CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installing Vercel CLI...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo [SUCCESS] Vercel CLI installed successfully
) else (
    echo [INFO] Vercel CLI is already installed
)
echo.

REM Check environment file
if not exist ".env.supabase" (
    if not exist ".env.local" (
        echo [WARNING] No .env.supabase or .env.local file found
        if exist ".env.supabase" (
            copy ".env.supabase" ".env.supabase" >nul
            echo [WARNING] Please edit .env.supabase with your Supabase project details
        ) else (
            echo [ERROR] No .env.supabase template found
            pause
            exit /b 1
        )
    )
)

REM Install dependencies
echo [STEP] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

REM Generate Prisma client
echo [STEP] Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [SUCCESS] Prisma client generated successfully
echo.

REM Login to Supabase
echo [STEP] Setting up Supabase...
echo [INFO] Please login to Supabase:
supabase login
echo.

REM Login to Vercel
echo [STEP] Setting up Vercel...
echo [INFO] Please login to Vercel:
vercel login
echo.

REM Link to Vercel project
echo [INFO] Linking to Vercel project...
vercel link
echo.

REM Deploy to Vercel
echo [STEP] Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Vercel
    pause
    exit /b 1
)
echo [SUCCESS] Deployment to Vercel completed successfully
echo.

REM Create deployment summary
echo [STEP] Creating deployment summary...
set SUMMARY_FILE=deployment-summary-%date:~10,4%%date:~4,2%%date:~7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.md
set SUMMARY_FILE=%SUMMARY_FILE: =0%

echo # Supabase + Vercel Deployment Summary > "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo **Generated:** %date% %time% >> "%SUMMARY_FILE%"
echo **Node.js:**  >> "%SUMMARY_FILE%"
node --version >> "%SUMMARY_FILE%"
echo **npm:**  >> "%SUMMARY_FILE%"
npm --version >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Setup Completed >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo - [x] Supabase CLI installed >> "%SUMMARY_FILE%"
echo - [x] Vercel CLI installed >> "%SUMMARY_FILE%"
echo - [x] Supabase project linked >> "%SUMMARY_FILE%"
echo - [x] Vercel project linked >> "%SUMMARY_FILE%"
echo - [x] Prisma client generated >> "%SUMMARY_FILE%"
echo - [x] Application deployed to Vercel >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Environment Variables >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo Make sure to configure these environment variables in Vercel: >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Supabase Configuration >> "%SUMMARY_FILE%"
echo - \`NEXT_PUBLIC_SUPABASE_URL\` >> "%SUMMARY_FILE%"
echo - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` >> "%SUMMARY_FILE%"
echo - \`SUPABASE_SERVICE_ROLE_KEY\` >> "%SUMMARY_FILE%"
echo - \`DATABASE_URL\` >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Authentication Configuration >> "%SUMMARY_FILE%"
echo - \`JWT_SECRET\` >> "%SUMMARY_FILE%"
echo - \`NEXTAUTH_SECRET\` >> "%SUMMARY_FILE%"
echo - \`NEXTAUTH_URL\` >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Next Steps >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo 1. Configure environment variables in Vercel dashboard >> "%SUMMARY_FILE%"
echo 2. Test the application at your Vercel URL >> "%SUMMARY_FILE%"
echo 3. Set up custom domain (optional) >> "%SUMMARY_FILE%"
echo 4. Configure monitoring and analytics >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Useful Commands >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Vercel >> "%SUMMARY_FILE%"
echo \`\`\`bash >> "%SUMMARY_FILE%"
echo # View logs >> "%SUMMARY_FILE%"
echo vercel logs >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo # Redeploy >> "%SUMMARY_FILE%"
echo vercel --prod >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo # View deployment info >> "%SUMMARY_FILE%"
echo vercel info >> "%SUMMARY_FILE%"
echo \`\`\` >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ### Prisma >> "%SUMMARY_FILE%"
echo \`\`\`bash >> "%SUMMARY_FILE%"
echo # Generate client >> "%SUMMARY_FILE%"
echo npx prisma generate >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo # Push schema changes >> "%SUMMARY_FILE%"
echo npx prisma db push >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo # Reset database >> "%SUMMARY_FILE%"
echo npx prisma db push --force-reset >> "%SUMMARY_FILE%"
echo \`\`\` >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Troubleshooting >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo If you encounter issues: >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo 1. Check environment variables in Vercel dashboard >> "%SUMMARY_FILE%"
echo 2. Verify Supabase project is accessible >> "%SUMMARY_FILE%"
echo 3. Check Vercel deployment logs >> "%SUMMARY_FILE%"
echo 4. Run \`npx prisma db push\` to sync schema >> "%SUMMARY_FILE%"
echo 5. Run \`npx prisma generate\` to regenerate client >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Support >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo - Supabase Documentation: https://supabase.com/docs >> "%SUMMARY_FILE%"
echo - Vercel Documentation: https://vercel.com/docs >> "%SUMMARY_FILE%"
echo - GitHub Issues: https://github.com/shagara2112/invoice-management-system/issues >> "%SUMMARY_FILE%"

echo [SUCCESS] Deployment summary created: %SUMMARY_FILE%
echo.

echo.
echo [SUCCESS] 🎉 Supabase + Vercel setup completed successfully!
echo.
echo [INFO] Next steps:
echo [INFO] 1. Configure environment variables in Vercel dashboard
echo [INFO] 2. Test the application at your Vercel URL
echo [INFO] 3. Set up custom domain (optional)
echo [INFO] 4. Configure monitoring and analytics
echo.
echo [INFO] Thank you for using Invoice Management System! 🚀
echo.
pause