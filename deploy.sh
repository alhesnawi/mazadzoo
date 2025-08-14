#!/bin/bash

# Deployment Script for Rare Animals Auction Platform
# Usage: ./deploy.sh [server_ip] [server_user]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP=${1:-"your_server_ip"}
SERVER_USER=${2:-"root"}
DOMAIN="mazadzoo.online"
REMOTE_PATH="/var/www/${DOMAIN}"

echo -e "${BLUE}🚀 Starting deployment for ${DOMAIN}${NC}"

# Check if server details are provided
if [ "$SERVER_IP" = "your_server_ip" ]; then
    echo -e "${RED}❌ Please provide server IP and user:${NC}"
    echo -e "${YELLOW}Usage: ./deploy.sh [server_ip] [server_user]${NC}"
    echo -e "${YELLOW}Example: ./deploy.sh 192.168.1.100 ubuntu${NC}"
    exit 1
fi

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if builds exist
echo -e "${BLUE}📋 Checking build files...${NC}"

if [ ! -d "auction-frontend/dist" ]; then
    print_error "Frontend build not found. Run: cd auction-frontend && npm run build"
    exit 1
fi

if [ ! -d "admin-dashboard/dist" ]; then
    print_error "Admin dashboard build not found. Run: cd admin-dashboard && npm run build"
    exit 1
fi

if [ ! -d "backend" ]; then
    print_error "Backend directory not found"
    exit 1
fi

print_status "All build files found"

# Create remote directories
echo -e "${BLUE}📁 Creating remote directories...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_PATH}/{auction-frontend,admin-dashboard,backend}"
print_status "Remote directories created"

# Upload frontend build
echo -e "${BLUE}📤 Uploading frontend build...${NC}"
rsync -avz --progress auction-frontend/dist/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/auction-frontend/dist/
print_status "Frontend uploaded"

# Upload admin dashboard build
echo -e "${BLUE}📤 Uploading admin dashboard build...${NC}"
rsync -avz --progress admin-dashboard/dist/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/admin-dashboard/dist/
print_status "Admin dashboard uploaded"

# Upload backend
echo -e "${BLUE}📤 Uploading backend...${NC}"
rsync -avz --progress --exclude 'node_modules' --exclude '.env' backend/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/backend/
print_status "Backend uploaded"

# Upload deployment guide
echo -e "${BLUE}📤 Uploading deployment guide...${NC}"
scp PRODUCTION_DEPLOYMENT_GUIDE.md ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/
scp BUILD_SUMMARY.md ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/
print_status "Documentation uploaded"

# Install backend dependencies on server
echo -e "${BLUE}📦 Installing backend dependencies on server...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_PATH}/backend && npm install --production"
print_status "Backend dependencies installed"

# Set proper permissions
echo -e "${BLUE}🔐 Setting file permissions...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "chown -R www-data:www-data ${REMOTE_PATH} && chmod -R 755 ${REMOTE_PATH}"
print_status "File permissions set"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${YELLOW}1. Configure Nginx (see PRODUCTION_DEPLOYMENT_GUIDE.md)${NC}"
echo -e "${YELLOW}2. Set up SSL certificates${NC}"
echo -e "${YELLOW}3. Configure environment variables in ${REMOTE_PATH}/backend/.env${NC}"
echo -e "${YELLOW}4. Start the backend with PM2${NC}"
echo -e "${YELLOW}5. Update DNS records to point to your server${NC}"
echo ""
echo -e "${BLUE}📁 Files deployed to: ${REMOTE_PATH}${NC}"
echo -e "${BLUE}🌐 Frontend: ${REMOTE_PATH}/auction-frontend/dist/${NC}"
echo -e "${BLUE}🔧 Admin: ${REMOTE_PATH}/admin-dashboard/dist/${NC}"
echo -e "${BLUE}⚙️  Backend: ${REMOTE_PATH}/backend/${NC}"
echo ""
echo -e "${GREEN}🚀 Your Rare Animals Auction Platform is ready for production!${NC}"