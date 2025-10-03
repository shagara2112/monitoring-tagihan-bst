#!/bin/bash

# 🚀 cPanel Deployment Script for Invoice Management System

echo "🔧 Invoice Management System - cPanel Deployment"
echo "=================================================="

# Configuration
CPANEL_USER=""
CPANEL_DOMAIN=""
CPANEL_PATH="/home/$CPANEL_USER/public_html/invoice-app"
PROJECT_NAME="invoice-management-system"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        print_warning "rsync not found, will use scp instead"
    fi
    
    print_success "Requirements check completed"
}

# Build the application
build_app() {
    print_status "Building application for production..."
    
    # Clean previous build
    rm -rf .next
    
    # Build for production
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    # Create temporary directory
    TEMP_DIR="/tmp/$PROJECT_NAME-deploy"
    rm -rf $TEMP_DIR
    mkdir -p $TEMP_DIR
    
    # Copy necessary files
    rsync -av --exclude='.git' \
              --exclude='node_modules' \
              --exclude='.next' \
              --exclude='.DS_Store' \
              --exclude='*.log' \
              --exclude='.env.local' \
              --exclude='scripts' \
              . $TEMP_DIR/
    
    # Copy server.js and cpanel-specific files
    cp server.js $TEMP_DIR/
    cp .htaccess $TEMP_DIR/
    cp package-cpanel.json $TEMP_DIR/package.json
    
    # Create deployment info
    cat > $TEMP_DIR/DEPLOYMENT_INFO.txt << EOF
Deployment Information
====================
Date: $(date)
Node.js Version: $(node --version)
npm Version: $(npm --version)
Environment: Production

Files Included:
- Next.js application
- Server.js for cPanel
- Package.json (production dependencies)
- .htaccess for Apache
- Environment variables template

Next Steps:
1. Upload to cPanel
2. Run: npm install --production
3. Setup environment variables
4. Start application
EOF
    
    print_success "Deployment package created at $TEMP_DIR"
}

# Upload to cPanel (if credentials provided)
upload_to_cpanel() {
    if [[ -z "$CPANEL_USER" || -z "$CPANEL_DOMAIN" ]]; then
        print_warning "cPanel credentials not provided. Please upload manually."
        print_status "Package location: $TEMP_DIR"
        return
    fi
    
    print_status "Uploading to cPanel..."
    
    # Create directory on server
    ssh $CPANEL_USER@$CPANEL_DOMAIN "mkdir -p $CPANEL_PATH" 2>/dev/null || true
    
    # Upload files
    if command -v rsync &> /dev/null; then
        rsync -avz --delete $TEMP_DIR/ $CPANEL_USER@$CPANEL_DOMAIN:$CPANEL_PATH/
    else
        # Use scp if rsync not available
        scp -r $TEMP_DIR/* $CPANEL_USER@$CPANEL_DOMAIN:$CPANEL_PATH/
    fi
    
    print_success "Files uploaded to cPanel"
}

# Install dependencies on cPanel
install_dependencies() {
    if [[ -z "$CPANEL_USER" || -z "$CPANEL_DOMAIN" ]]; then
        print_warning "Cannot install dependencies automatically. Please run manually on cPanel:"
        print_status "cd $CPANEL_PATH && npm install --production"
        return
    fi
    
    print_status "Installing dependencies on cPanel..."
    
    ssh $CPANEL_USER@$CPANEL_DOMAIN "cd $CPANEL_PATH && npm install --production"
    
    if [[ $? -eq 0 ]]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
    fi
}

# Setup environment variables template
setup_env_template() {
    print_status "Creating environment variables template..."
    
    cat > $TEMP_DIR/.env.example << EOF
# Environment Variables for cPanel Deployment
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (if using MySQL instead of Supabase)
DATABASE_URL=mysql://username:password@localhost/database_name

# Application Configuration
PORT=3000
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EOF
    
    print_success "Environment template created"
}

# Create deployment instructions
create_instructions() {
    print_status "Creating deployment instructions..."
    
    cat > $TEMP_DIR/CPANEL_SETUP_INSTRUCTIONS.md << EOF
# cPanel Setup Instructions

## 1. Upload Files
All files have been uploaded to: $CPANEL_PATH

## 2. Setup Node.js App in cPanel
1. Login to cPanel
2. Go to "Setup Node.js App"
3. Click "Create Application"
4. Configure:
   - Application Root: invoice-app
   - Application URL: invoice-app.yourdomain.com
   - Application Startup File: server.js
   - Node.js Version: 18.x

## 3. Install Dependencies
Run in cPanel Terminal or SSH:
\`\`\`bash
cd $CPANEL_PATH
npm install --production
\`\`\`

## 4. Setup Environment Variables
In cPanel Node.js App → Environment Variables:
- Copy from .env.example
- Replace with your actual values

## 5. Start Application
Click "Restart" in cPanel Node.js App

## 6. Test Application
Visit: https://invoice-app.yourdomain.com

## Troubleshooting
- Check logs: cPanel → Setup Node.js App → View Logs
- Restart application if needed
- Verify environment variables

## Support
- GitHub: https://github.com/shagara2112/invoice-management-system
- Documentation: CPANEL_DEPLOYMENT_GUIDE.md
EOF
    
    print_success "Setup instructions created"
}

# Main deployment flow
main() {
    echo ""
    print_status "Starting cPanel deployment process..."
    echo ""
    
    # Check if configuration is provided
    if [[ -z "$CPANEL_USER" || -z "$CPANEL_DOMAIN" ]]; then
        print_warning "cPanel credentials not configured."
        print_status "Edit this script and set:"
        print_status "  CPANEL_USER='your_cpanel_username'"
        print_status "  CPANEL_DOMAIN='yourdomain.com'"
        echo ""
        read -p "Continue with manual deployment? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Execute deployment steps
    check_requirements
    build_app
    create_package
    setup_env_template
    create_instructions
    upload_to_cpanel
    install_dependencies
    
    echo ""
    print_success "🎉 Deployment completed!"
    echo ""
    print_status "Next steps:"
    print_status "1. Login to cPanel"
    print_status "2. Setup Node.js App"
    print_status "3. Configure environment variables"
    print_status "4. Start application"
    echo ""
    print_status "Deployment package location: $TEMP_DIR"
    print_status "Instructions: $TEMP_DIR/CPANEL_SETUP_INSTRUCTIONS.md"
    echo ""
}

# Run main function
main "$@"