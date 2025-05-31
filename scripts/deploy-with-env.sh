#!/bin/bash

# Deploy with Environment Variables Setup Script
# This script helps set up and deploy the Jobs2Go platform with proper environment configuration

set -e

echo "🚀 Jobs2Go Platform Deployment with Environment Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_info "Please edit .env file with your actual values before continuing."
        print_info "Press Enter when ready to continue..."
        read
    else
        print_error ".env.example file not found. Please create .env manually."
        exit 1
    fi
fi

# Verify environment variables
print_info "Verifying environment variables..."
npm run verify:env

if [ $? -ne 0 ]; then
    print_error "Environment verification failed. Please check your .env file."
    exit 1
fi

print_status "Environment variables verified successfully"

# Install dependencies
print_info "Installing dependencies..."
npm install

# Build the application
print_info "Building application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please check the error messages above."
    exit 1
fi

print_status "Build completed successfully"

# Deploy to Vercel
print_info "Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully!"
    print_info "Your application should now be live on Vercel."
    print_info "Don't forget to:"
    print_info "1. Update NEXT_PUBLIC_APP_URL with your live URL"
    print_info "2. Set up environment variables in Vercel dashboard"
    print_info "3. Test the monitoring endpoints"
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi

echo ""
print_status "Deployment process completed!"
