#!/bin/bash

# 🚀 Production Deployment Script for Invoice Management System
# Supports Docker, Vercel, Railway, and cPanel deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║          🚀 Invoice Management System Deployment           ║"
    echo "║                     Production Ready                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_step "Checking requirements..."
    
    local missing_tools=()
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if [ "$DEPLOYMENT_TYPE" = "docker" ] && ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if [ "$DEPLOYMENT_TYPE" = "docker" ] && ! command -v docker-compose &> /dev/null; then
        missing_tools+=("docker-compose")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install the missing tools and try again"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Validate environment variables
validate_env() {
    print_step "Validating environment variables..."
    
    if [ ! -f ".env.production" ]; then
        if [ ! -f ".env.local" ]; then
            print_warning "No .env.production or .env.local file found"
            print_status "Creating .env.production from template..."
            
            if [ -f ".env.example" ]; then
                cp .env.example .env.production
                print_warning "Please edit .env.production with your production values"
                read -p "Press Enter to continue after editing .env.production..."
            else
                print_error "No .env.example template found"
                exit 1
            fi
        else
            print_warning "Using .env.local for production (consider creating .env.production)"
        fi
    fi
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
    
    # Validate required variables
    local required_vars=("JWT_SECRET" "NEXTAUTH_SECRET")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    print_success "Environment variables validated"
}

# Build the application
build_app() {
    print_step "Building application for production..."
    
    # Clean previous builds
    rm -rf .next
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --only=production
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Build the application
    print_status "Building Next.js application..."
    NODE_ENV=production npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Docker deployment
deploy_docker() {
    print_step "Preparing Docker deployment..."
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found"
        exit 1
    fi
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found"
        exit 1
    fi
    
    # Build Docker image
    print_status "Building Docker image..."
    docker build -t invoice-management-system .
    
    # Run docker-compose
    print_status "Starting services with docker-compose..."
    docker-compose up -d
    
    print_success "Docker deployment completed"
    print_status "Application is running at http://localhost:3000"
}

# Vercel deployment
deploy_vercel() {
    print_step "Preparing Vercel deployment..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_success "Vercel deployment completed"
}

# Railway deployment
deploy_railway() {
    print_step "Preparing Railway deployment..."
    
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    print_status "Logging in to Railway..."
    railway login
    
    # Deploy to Railway
    print_status "Deploying to Railway..."
    railway up
    
    print_success "Railway deployment completed"
}

# cPanel deployment
deploy_cpanel() {
    print_step "Preparing cPanel deployment..."
    
    # Create deployment package
    print_status "Creating deployment package..."
    
    local TEMP_DIR="/tmp/invoice-app-deploy-$(date +%s)"
    mkdir -p "$TEMP_DIR"
    
    # Copy necessary files
    rsync -av --exclude='.git' \
              --exclude='node_modules' \
              --exclude='.next' \
              --exclude='.DS_Store' \
              --exclude='*.log' \
              --exclude='.env.local' \
              --exclude='scripts' \
              --exclude='docker-compose.yml' \
              --exclude='Dockerfile' \
              . "$TEMP_DIR/"
    
    # Copy production server file
    cp server.js "$TEMP_DIR/"
    
    # Copy cpanel package.json if exists
    if [ -f "package-cpanel.json" ]; then
        cp package-cpanel.json "$TEMP_DIR/package.json"
    fi
    
    # Create .env.production
    if [ -f ".env.production" ]; then
        cp .env.production "$TEMP_DIR/"
    fi
    
    # Create deployment instructions
    cat > "$TEMP_DIR/DEPLOYMENT_INSTRUCTIONS.md" << EOF
# cPanel Deployment Instructions

## 1. Upload Files
Upload all files in this directory to your cPanel hosting account.

## 2. Setup Node.js App
1. Login to cPanel
2. Go to "Setup Node.js App"
3. Create Application with:
   - Application Root: invoice-app
   - Application URL: your-domain.com
   - Application Startup File: server.js
   - Node.js Version: 18.x or higher

## 3. Install Dependencies
Run in cPanel Terminal:
\`\`\`bash
cd invoice-app
npm install --production
\`\`\`

## 4. Setup Environment Variables
Configure environment variables in cPanel Node.js App settings.

## 5. Start Application
Click "Restart" in cPanel Node.js App

## 6. Setup Database
If using PostgreSQL or MySQL, setup database in cPanel and update DATABASE_URL.
EOF
    
    # Create zip file
    local ZIP_FILE="invoice-app-cpanel-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$ZIP_FILE" -C "$TEMP_DIR" .
    
    print_success "Deployment package created: $ZIP_FILE"
    print_status "Upload this file to your cPanel hosting and follow DEPLOYMENT_INSTRUCTIONS.md"
    
    # Cleanup
    rm -rf "$TEMP_DIR"
}

# Database setup
setup_database() {
    print_step "Setting up database..."
    
    if [ "$DATABASE_URL" ]; then
        # Check if it's PostgreSQL
        if [[ "$DATABASE_URL" == postgresql* ]]; then
            print_status "Running Prisma migrations on PostgreSQL..."
            DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
        else
            print_status "Running Prisma migrations on database..."
            npx prisma migrate deploy
        fi
        
        # Seed database if needed
        if [ "$SEED_DATABASE" = "true" ]; then
            print_status "Seeding database..."
            npm run seed
        fi
        
        print_success "Database setup completed"
    else
        print_warning "No DATABASE_URL configured, skipping database setup"
    fi
}

# Health check
health_check() {
    print_step "Performing health check..."
    
    local app_url="${APP_URL:-http://localhost:3000}"
    
    print_status "Checking application health at $app_url..."
    
    if command -v curl &> /dev/null; then
        if curl -f -s "$app_url/api/health" > /dev/null; then
            print_success "Application health check passed"
        else
            print_warning "Application health check failed"
        fi
    else
        print_warning "curl not available, skipping health check"
    fi
}

# Main deployment flow
main() {
    print_header
    
    # Parse command line arguments
    DEPLOYMENT_TYPE=${1:-docker}
    
    case $DEPLOYMENT_TYPE in
        docker|vercel|railway|cpanel)
            print_status "Deployment type: $DEPLOYMENT_TYPE"
            ;;
        *)
            print_error "Invalid deployment type: $DEPLOYMENT_TYPE"
            print_status "Usage: $0 [docker|vercel|railway|cpanel]"
            exit 1
            ;;
    esac
    
    echo ""
    
    # Execute deployment steps
    check_requirements
    validate_env
    build_app
    setup_database
    
    case $DEPLOYMENT_TYPE in
        docker)
            deploy_docker
            ;;
        vercel)
            deploy_vercel
            ;;
        railway)
            deploy_railway
            ;;
        cpanel)
            deploy_cpanel
            ;;
    esac
    
    health_check
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    
    # Show next steps based on deployment type
    case $DEPLOYMENT_TYPE in
        docker)
            print_status "Next steps:"
            print_status "1. Configure your domain to point to the server"
            print_status "2. Setup SSL certificate"
            print_status "3. Configure backup strategy"
            ;;
        vercel)
            print_status "Next steps:"
            print_status "1. Configure custom domain in Vercel dashboard"
            print_status "2. Setup environment variables in Vercel"
            print_status "3. Configure analytics if needed"
            ;;
        railway)
            print_status "Next steps:"
            print_status "1. Configure custom domain in Railway dashboard"
            print_status "2. Setup environment variables in Railway"
            print_status "3. Monitor logs in Railway dashboard"
            ;;
        cpanel)
            print_status "Next steps:"
            print_status "1. Upload the deployment package to cPanel"
            print_status "2. Follow DEPLOYMENT_INSTRUCTIONS.md"
            print_status "3. Test the application"
            ;;
    esac
    
    echo ""
    print_status "Thank you for using Invoice Management System! 🚀"
}

# Run main function with all arguments
main "$@"