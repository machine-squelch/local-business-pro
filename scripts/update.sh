#!/bin/bash

# LocalBrand Pro Update Script

# Configuration
PROJECT_DIR="/Users/agurley/local-business-pro-main"
BACKEND_DIR="/Users/agurley/local-business-pro-main/backend"
FRONTEND_DIR="/Users/agurley/local-business-pro-main/frontend"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting LocalBrand Pro update process...${NC}"

# Create backup
echo -e "${BLUE}Creating database backup...${NC}"
"/Users/agurley/local-business-pro-main/scripts/backup-db.sh"

if [ $? -ne 0 ]; then
  echo -e "${RED}Backup failed. Aborting update.${NC}"
  exit 1
fi

# Pull latest changes
echo -e "${BLUE}Pulling latest changes...${NC}"
cd "$PROJECT_DIR"
git pull

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to pull latest changes. Aborting update.${NC}"
  exit 1
fi

# Update backend
echo -e "${BLUE}Updating backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --production

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to update backend dependencies.${NC}"
  exit 1
fi

# Update frontend
echo -e "${BLUE}Updating frontend dependencies...${NC}"
cd "$FRONTEND_DIR"
npm install --production

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to update frontend dependencies.${NC}"
  exit 1
fi

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
cd "$FRONTEND_DIR"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build frontend.${NC}"
  exit 1
fi

# Restart services
echo -e "${BLUE}Restarting services...${NC}"
pm2 reload localbrand-pro-backend

echo -e "${GREEN}Update completed successfully.${NC}"
