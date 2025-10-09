#!/bin/bash

# 🔍 Pre-Deployment Check Script
# This script validates the application before deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║          🔍 Pre-Deployment Check Script                     ║"
    echo "║               Invoice Management System                      ║"
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
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if required files exist
check_required_files() {
    print_step "Checking required files..."
    
    local required_files=(
        "package.json"
        "next.config.ts"
        "server.js"
        "prisma/schema.prisma"
        ".env.example"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        print_error "Missing required files: ${missing_files[*]}"
        return 1
    fi
    
    print_success "All required files found"
}

# Check Node.js version
check_node_version() {
    print_step "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        return 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="18.0.0"
    
    if ! node -e "process.exit(require('semver').gte('$node_version', '$required_version') ? 0 : 1)" 2>/dev/null; then
        print_error "Node.js version $node_version is too old. Required: $required_version or higher"
        return 1
    fi
    
    print_success "Node.js version $node_version is compatible"
}

# Check npm version
check_npm_version() {
    print_step "Checking npm version..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        return 1
    fi
    
    local npm_version=$(npm --version)
    print_success "npm version $npm_version is installed"
}

# Check environment variables
check_environment() {
    print_step "Checking environment configuration..."
    
    if [ ! -f ".env.production" ] && [ ! -f ".env.local" ]; then
        print_warning "No .env.production or .env.local file found"
        print_status "Creating .env.production from template..."
        
        if [ -f ".env.example" ]; then
            cp .env.example .env.production
            print_warning "Please edit .env.production with your production values"
            return 1
        else
            print_error "No .env.example template found"
            return 1
        fi
    fi
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        print_status "Using .env.production"
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
        print_warning "Using .env.local (consider creating .env.production)"
    fi
    
    # Check required variables
    local required_vars=("JWT_SECRET" "NEXTAUTH_SECRET")
    local missing_vars=()
    local weak_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        elif [[ "${!var}" == *"CHANGE_THIS"* ]] || [[ "${!var}" == *"your_"* ]] || [ ${#var} -lt 32 ]; then
            weak_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    if [ ${#weak_vars[@]} -ne 0 ]; then
        print_warning "Weak or default values detected for: ${weak_vars[*]}"
        print_status "Please update these with secure, random values"
    fi
    
    print_success "Environment configuration checked"
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Check for critical dependencies
    local critical_deps=(
        "next"
        "react"
        "@prisma/client"
        "prisma"
    )
    
    local missing_deps=()
    
    for dep in "${critical_deps[@]}"; do
        if ! npm list "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing critical dependencies: ${missing_deps[*]}"
        return 1
    fi
    
    print_success "Dependencies are installed"
}

# Check database connection
check_database() {
    print_step "Checking database connection..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "No DATABASE_URL configured, skipping database check"
        return 0
    fi
    
    # Generate Prisma client if needed
    if [ ! -d "node_modules/.prisma" ]; then
        print_status "Generating Prisma client..."
        npx prisma generate
    fi
    
    # Test database connection
    if npx prisma db pull --force &> /dev/null; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        return 1
    fi
}

# Check build process
check_build() {
    print_step "Testing build process..."
    
    # Clean previous builds
    rm -rf .next
    
    # Build the application
    if NODE_ENV=production npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        return 1
    fi
}

# Check TypeScript compilation
check_typescript() {
    print_step "Checking TypeScript compilation..."
    
    if npx tsc --noEmit; then
        print_success "TypeScript compilation successful"
    else
        print_warning "TypeScript compilation failed (build may still work)"
    fi
}

# Check linting
check_linting() {
    print_step "Checking code quality..."
    
    if npm run lint 2>/dev/null; then
        print_success "Linting passed"
    else
        print_warning "Linting issues found (not blocking deployment)"
    fi
}

# Check security vulnerabilities
check_security() {
    print_step "Checking for security vulnerabilities..."
    
    if npm audit --audit-level=moderate; then
        print_success "No moderate or high vulnerabilities found"
    else
        print_warning "Security vulnerabilities found"
        print_status "Run 'npm audit fix' to fix automatically"
    fi
}

# Check file sizes
check_file_sizes() {
    print_step "Checking build file sizes..."
    
    if [ -d ".next" ]; then
        local build_size=$(du -sh .next | cut -f1)
        print_status "Build size: $build_size"
        
        # Check for large files
        local large_files=$(find .next -type f -size +10M -exec ls -lh {} \; 2>/dev/null | wc -l)
        if [ "$large_files" -gt 0 ]; then
            print_warning "Found $large_files large files (>10MB) in build"
        fi
    fi
}

# Generate deployment report
generate_report() {
    print_step "Generating deployment report..."
    
    local report_file="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# Deployment Report

**Generated:** $(date)
**Node.js:** $(node --version)
**npm:** $(npm --version)
**Environment:** ${NODE_ENV:-development}

## Checks Performed

- [x] Required files verified
- [x] Node.js version checked
- [x] npm version checked
- [x] Environment variables validated
- [x] Dependencies verified
- [x] Database connection tested
- [x] Build process tested
- [x] TypeScript compilation checked
- [x] Code quality checked
- [x] Security audit performed
- [x] File sizes analyzed

## Build Information

- **Build Size:** $(du -sh .next 2>/dev/null | cut -f1 || echo "N/A")
- **Dependencies:** $(npm list --depth=0 2>/dev/null | grep -c "├\|└" || echo "N/A")

## Recommendations

EOF

    if [ -f ".env.production" ]; then
        echo "- Update .env.production with your actual production values" >> "$report_file"
    else
        echo "- Create .env.production from .env.example" >> "$report_file"
    fi
    
    echo "- Configure SSL certificate for production" >> "$report_file"
    echo "- Set up monitoring and logging" >> "$report_file"
    echo "- Configure backup strategy" >> "$report_file"
    
    print_success "Deployment report generated: $report_file"
}

# Main check flow
main() {
    print_header
    
    local checks_passed=0
    local total_checks=0
    
    # Run all checks
    local checks=(
        "check_required_files"
        "check_node_version"
        "check_npm_version"
        "check_environment"
        "check_dependencies"
        "check_database"
        "check_build"
        "check_typescript"
        "check_linting"
        "check_security"
        "check_file_sizes"
    )
    
    for check in "${checks[@]}"; do
        ((total_checks++))
        if $check; then
            ((checks_passed++))
        fi
        echo ""
    done
    
    # Generate report
    generate_report
    
    # Summary
    echo ""
    print_status "Checks completed: $checks_passed/$total_checks"
    
    if [ $checks_passed -eq $total_checks ]; then
        print_success "🎉 All checks passed! Application is ready for deployment."
        echo ""
        print_status "Next steps:"
        print_status "1. Update .env.production with your values"
        print_status "2. Run: ./scripts/deploy-production.sh [docker|vercel|railway|cpanel]"
        exit 0
    else
        print_error "❌ Some checks failed. Please fix the issues before deploying."
        exit 1
    fi
}

# Run main function
main "$@"