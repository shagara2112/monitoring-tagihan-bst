#!/bin/bash

# 🚀 Supabase + Vercel Setup Script
# This script helps set up the Invoice Management System with Supabase and Vercel

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
    echo "║      🚀 Supabase + Vercel Setup Script                     ║"
    echo "║           Invoice Management System                          ║"
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
    
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install the missing tools and try again"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Install Supabase CLI
install_supabase_cli() {
    print_step "Installing Supabase CLI..."
    
    if command -v supabase &> /dev/null; then
        print_status "Supabase CLI is already installed"
    else
        print_status "Installing Supabase CLI..."
        npm install -g supabase
        
        if command -v supabase &> /dev/null; then
            print_success "Supabase CLI installed successfully"
        else
            print_error "Failed to install Supabase CLI"
            exit 1
        fi
    fi
}

# Install Vercel CLI
install_vercel_cli() {
    print_step "Installing Vercel CLI..."
    
    if command -v vercel &> /dev/null; then
        print_status "Vercel CLI is already installed"
    else
        print_status "Installing Vercel CLI..."
        npm install -g vercel
        
        if command -v vercel &> /dev/null; then
            print_success "Vercel CLI installed successfully"
        else
            print_error "Failed to install Vercel CLI"
            exit 1
        fi
    fi
}

# Setup Supabase project
setup_supabase() {
    print_step "Setting up Supabase project..."
    
    # Check if already logged in to Supabase
    if supabase projects list &> /dev/null; then
        print_status "Already logged in to Supabase"
    else
        print_status "Please login to Supabase:"
        supabase login
    fi
    
    # Check if .env.supabase exists
    if [ ! -f ".env.supabase" ]; then
        print_warning ".env.supabase file not found"
        print_status "Creating .env.supabase from template..."
        
        if [ -f ".env.supabase" ]; then
            cp .env.supabase .env.supabase
            print_warning "Please edit .env.supabase with your Supabase project details"
        else
            print_error "No .env.supabase template found"
            exit 1
        fi
    fi
    
    # Link to Supabase project
    if [ -d "supabase" ]; then
        print_status "Linking to Supabase project..."
        supabase link --project-ref your-project-ref
    else
        print_warning "No supabase directory found"
    fi
    
    print_success "Supabase setup completed"
}

# Setup Vercel project
setup_vercel() {
    print_step "Setting up Vercel project..."
    
    # Check if already logged in to Vercel
    if vercel whoami &> /dev/null; then
        print_status "Already logged in to Vercel"
    else
        print_status "Please login to Vercel:"
        vercel login
    fi
    
    # Link to Vercel project
    print_status "Linking to Vercel project..."
    vercel link
    
    print_success "Vercel setup completed"
}

# Generate Prisma client
generate_prisma_client() {
    print_step "Generating Prisma client..."
    
    # Load environment variables
    if [ -f ".env.supabase" ]; then
        export $(cat .env.supabase | grep -v '^#' | xargs)
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
    
    # Generate Prisma client
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        print_success "Prisma client generated successfully"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
}

# Push database schema to Supabase
push_database_schema() {
    print_step "Pushing database schema to Supabase..."
    
    # Load environment variables
    if [ -f ".env.supabase" ]; then
        export $(cat .env.supabase | grep -v '^#' | xargs)
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
    
    # Push database schema
    npx prisma db push
    
    if [ $? -eq 0 ]; then
        print_success "Database schema pushed successfully"
    else
        print_error "Failed to push database schema"
        exit 1
    fi
}

# Seed database with initial data
seed_database() {
    print_step "Seeding database with initial data..."
    
    # Load environment variables
    if [ -f ".env.supabase" ]; then
        export $(cat .env.supabase | grep -v '^#' | xargs)
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
    
    # Seed database
    if [ -f "supabase/seed.sql" ]; then
        npx prisma db execute --file supabase/seed.sql
        print_success "Database seeded successfully"
    else
        print_warning "No seed file found"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_step "Deploying to Vercel..."
    
    # Deploy to Vercel
    vercel --prod
    
    if [ $? -eq 0 ]; then
        print_success "Deployment to Vercel completed successfully"
    else
        print_error "Failed to deploy to Vercel"
        exit 1
    fi
}

# Create deployment summary
create_deployment_summary() {
    print_step "Creating deployment summary..."
    
    local summary_file="deployment-summary-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$summary_file" << EOF
# Supabase + Vercel Deployment Summary

**Generated:** $(date)
**Node.js:** $(node --version)
**npm:** $(npm --version)

## Setup Completed

- [x] Supabase CLI installed
- [x] Vercel CLI installed
- [x] Supabase project linked
- [x] Vercel project linked
- [x] Prisma client generated
- [x] Database schema pushed
- [x] Database seeded

## Environment Variables

Make sure to configure these environment variables in Vercel:

### Supabase Configuration
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`DATABASE_URL\`

### Authentication Configuration
- \`JWT_SECRET\`
- \`NEXTAUTH_SECRET\`
- \`NEXTAUTH_URL\`

## Next Steps

1. Configure environment variables in Vercel dashboard
2. Test the application at your Vercel URL
3. Set up custom domain (optional)
4. Configure monitoring and analytics

## Useful Commands

### Supabase
\`\`\`bash
# View database
supabase db studio

# Generate types
supabase gen types typescript --local > src/types/supabase.ts

# Reset database
supabase db reset
\`\`\`

### Vercel
\`\`\`bash
# View logs
vercel logs

# Redeploy
vercel --prod

# View deployment info
vercel info
\`\`\`

### Prisma
\`\`\`bash
# Generate client
npx prisma generate

# Push schema changes
npx prisma db push

# Reset database
npx prisma db push --force-reset
\`\`\`

## Troubleshooting

If you encounter issues:

1. Check environment variables in Vercel dashboard
2. Verify Supabase project is accessible
3. Check Vercel deployment logs
4. Run \`npx prisma db push\` to sync schema
5. Run \`npx prisma generate\` to regenerate client

## Support

- Supabase Documentation: https://supabase.com/docs
- Vercel Documentation: https://vercel.com/docs
- GitHub Issues: https://github.com/shagara2112/invoice-management-system/issues
EOF

    print_success "Deployment summary created: $summary_file"
}

# Main setup flow
main() {
    print_header
    
    # Execute setup steps
    check_requirements
    install_supabase_cli
    install_vercel_cli
    setup_supabase
    setup_vercel
    generate_prisma_client
    push_database_schema
    seed_database
    deploy_to_vercel
    create_deployment_summary
    
    echo ""
    print_success "🎉 Supabase + Vercel setup completed successfully!"
    echo ""
    print_status "Next steps:"
    print_status "1. Configure environment variables in Vercel dashboard"
    print_status "2. Test the application at your Vercel URL"
    print_status "3. Set up custom domain (optional)"
    print_status "4. Configure monitoring and analytics"
    echo ""
    print_status "Thank you for using Invoice Management System! 🚀"
}

# Run main function
main "$@"