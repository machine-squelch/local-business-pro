#!/bin/bash

# LocalBrand Pro Deployment Script
# This script automates the deployment of the LocalBrand Pro application

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                     LocalBrand Pro                            ║"
echo "║                  Deployment Script                            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running with root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: This script may require root privileges for some operations.${NC}"
  echo -e "${YELLOW}Consider running with sudo if you encounter permission issues.${NC}"
  echo ""
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check and install dependencies
check_and_install_dependencies() {
  echo -e "${BLUE}Checking system dependencies...${NC}"
  
  local dependencies=("nodejs" "npm" "mongodb" "git")
  local missing_deps=()
  
  for dep in "${dependencies[@]}"; do
    echo -n "Checking for $dep... "
    if command_exists "$dep"; then
      echo -e "${GREEN}Found${NC}"
    else
      echo -e "${RED}Not found${NC}"
      missing_deps+=("$dep")
    fi
  done
  
  if [ ${#missing_deps[@]} -ne 0 ]; then
    echo -e "${YELLOW}The following dependencies are missing:${NC}"
    for dep in "${missing_deps[@]}"; do
      echo "  - $dep"
    done
    
    read -p "Would you like to install the missing dependencies? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Installing missing dependencies...${NC}"
      
      # Update package lists
      apt-get update
      
      # Install dependencies
      for dep in "${missing_deps[@]}"; do
        case $dep in
          nodejs)
            echo -e "${BLUE}Installing Node.js...${NC}"
            curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
            apt-get install -y nodejs
            ;;
          npm)
            echo -e "${BLUE}Installing npm...${NC}"
            apt-get install -y npm
            ;;
          mongodb)
            echo -e "${BLUE}Installing MongoDB...${NC}"
            wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
            apt-get update
            apt-get install -y mongodb-org
            systemctl start mongod
            systemctl enable mongod
            ;;
          git)
            echo -e "${BLUE}Installing git...${NC}"
            apt-get install -y git
            ;;
        esac
      done
      
      echo -e "${GREEN}Dependencies installed successfully.${NC}"
    else
      echo -e "${RED}Deployment cannot continue without required dependencies.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}All dependencies are installed.${NC}"
  fi
  
  # Check Node.js version
  NODE_VERSION=$(node -v | cut -d 'v' -f 2)
  NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
  
  if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
    echo -e "${YELLOW}Warning: Node.js version $NODE_VERSION detected.${NC}"
    echo -e "${YELLOW}LocalBrand Pro requires Node.js 16.x or higher.${NC}"
    
    read -p "Would you like to upgrade Node.js? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Upgrading Node.js...${NC}"
      curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
      apt-get install -y nodejs
      echo -e "${GREEN}Node.js upgraded successfully.${NC}"
    else
      echo -e "${RED}Deployment may fail with Node.js version $NODE_VERSION.${NC}"
    fi
  fi
  
  echo ""
}

# Function to configure environment
configure_environment() {
  echo -e "${BLUE}Configuring environment...${NC}"
  
  # Create backend .env file
  echo -e "${BLUE}Creating backend environment configuration...${NC}"
  
  if [ -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}Backend .env file already exists.${NC}"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${GREEN}Keeping existing backend .env file.${NC}"
    else
      create_backend_env
    fi
  else
    create_backend_env
  fi
  
  # Create frontend .env file
  echo -e "${BLUE}Creating frontend environment configuration...${NC}"
  
  if [ -f "$FRONTEND_DIR/.env" ]; then
    echo -e "${YELLOW}Frontend .env file already exists.${NC}"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${GREEN}Keeping existing frontend .env file.${NC}"
    else
      create_frontend_env
    fi
  else
    create_frontend_env
  fi
  
  echo -e "${GREEN}Environment configuration complete.${NC}"
  echo ""
}

# Function to create backend .env file
create_backend_env() {
  # Generate random JWT secret
  JWT_SECRET=$(openssl rand -base64 32)
  
  # Get MongoDB URI
  read -p "Enter MongoDB URI (default: mongodb://localhost:27017/localbrand): " MONGODB_URI
  MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/localbrand}
  
  # Get port
  read -p "Enter backend port (default: 5000): " PORT
  PORT=${PORT:-5000}
  
  # Get Adobe Express API key
  read -p "Enter Adobe Express API key (leave blank to skip): " ADOBE_EXPRESS_API_KEY
  
  # Create .env file
  cat > "$BACKEND_DIR/.env" << EOL
NODE_ENV=production
PORT=$PORT
MONGODB_URI=$MONGODB_URI
JWT_SECRET=$JWT_SECRET
ADOBE_EXPRESS_API_KEY=$ADOBE_EXPRESS_API_KEY
EOL
  
  echo -e "${GREEN}Backend .env file created successfully.${NC}"
}

# Function to create frontend .env file
create_frontend_env() {
  # Get backend URL
  read -p "Enter backend API URL (default: http://localhost:5000/api): " REACT_APP_API_URL
  REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:5000/api}
  
  # Create .env file
  cat > "$FRONTEND_DIR/.env" << EOL
REACT_APP_API_URL=$REACT_APP_API_URL
EOL
  
  echo -e "${GREEN}Frontend .env file created successfully.${NC}"
}

# Function to install backend dependencies
install_backend_dependencies() {
  echo -e "${BLUE}Installing backend dependencies...${NC}"
  
  cd "$BACKEND_DIR"
  npm install --production
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend dependencies installed successfully.${NC}"
  else
    echo -e "${RED}Failed to install backend dependencies.${NC}"
    exit 1
  fi
  
  echo ""
}

# Function to install frontend dependencies
install_frontend_dependencies() {
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  
  cd "$FRONTEND_DIR"
  npm install --production
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend dependencies installed successfully.${NC}"
  else
    echo -e "${RED}Failed to install frontend dependencies.${NC}"
    exit 1
  fi
  
  echo ""
}

# Function to build frontend
build_frontend() {
  echo -e "${BLUE}Building frontend...${NC}"
  
  cd "$FRONTEND_DIR"
  npm run build
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend built successfully.${NC}"
  else
    echo -e "${RED}Failed to build frontend.${NC}"
    exit 1
  fi
  
  echo ""
}

# Function to setup PM2 for backend
setup_pm2() {
  echo -e "${BLUE}Setting up PM2 process manager...${NC}"
  
  # Check if PM2 is installed
  if ! command_exists pm2; then
    echo -e "${YELLOW}PM2 is not installed. Installing...${NC}"
    npm install -g pm2
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install PM2.${NC}"
      exit 1
    fi
  fi
  
  # Create PM2 ecosystem file
  cat > "$PROJECT_DIR/ecosystem.config.js" << EOL
module.exports = {
  apps: [
    {
      name: 'localbrand-pro-backend',
      script: '$BACKEND_DIR/src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOL
  
  echo -e "${GREEN}PM2 setup complete.${NC}"
  echo ""
}

# Function to setup Nginx
setup_nginx() {
  echo -e "${BLUE}Setting up Nginx...${NC}"
  
  # Check if Nginx is installed
  if ! command_exists nginx; then
    echo -e "${YELLOW}Nginx is not installed. Installing...${NC}"
    apt-get update
    apt-get install -y nginx
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install Nginx.${NC}"
      exit 1
    fi
  fi
  
  # Get domain name
  read -p "Enter domain name (leave blank for localhost): " DOMAIN_NAME
  
  # Create Nginx configuration
  if [ -z "$DOMAIN_NAME" ]; then
    # Local configuration
    cat > "/etc/nginx/sites-available/localbrand-pro" << EOL
server {
    listen 80;
    server_name localhost;

    location / {
        root $FRONTEND_DIR/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
  else
    # Domain configuration
    cat > "/etc/nginx/sites-available/localbrand-pro" << EOL
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        root $FRONTEND_DIR/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
  fi
  
  # Enable site
  ln -sf /etc/nginx/sites-available/localbrand-pro /etc/nginx/sites-enabled/
  
  # Test Nginx configuration
  nginx -t
  
  if [ $? -eq 0 ]; then
    # Restart Nginx
    systemctl restart nginx
    echo -e "${GREEN}Nginx setup complete.${NC}"
  else
    echo -e "${RED}Nginx configuration test failed.${NC}"
    exit 1
  fi
  
  echo ""
}

# Function to create database backup script
create_backup_script() {
  echo -e "${BLUE}Creating database backup script...${NC}"
  
  cat > "$PROJECT_DIR/scripts/backup-db.sh" << EOL
#!/bin/bash

# LocalBrand Pro Database Backup Script

# Configuration
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="\$BACKUP_DIR/localbrand_backup_\$TIMESTAMP.gz"

# Create backup directory if it doesn't exist
mkdir -p "\$BACKUP_DIR"

# Create backup
echo "Creating database backup..."
mongodump --uri="$MONGODB_URI" --gzip --archive="\$BACKUP_FILE"

if [ \$? -eq 0 ]; then
  echo "Backup created successfully: \$BACKUP_FILE"
  
  # Clean up old backups (keep last 10)
  echo "Cleaning up old backups..."
  ls -tp "\$BACKUP_DIR" | grep -v '/$' | tail -n +11 | xargs -I {} rm -- "\$BACKUP_DIR/{}"
  
  echo "Backup process completed."
else
  echo "Backup failed."
  exit 1
fi
EOL
  
  chmod +x "$PROJECT_DIR/scripts/backup-db.sh"
  
  echo -e "${GREEN}Backup script created: $PROJECT_DIR/scripts/backup-db.sh${NC}"
  echo ""
}

# Function to create update script
create_update_script() {
  echo -e "${BLUE}Creating update script...${NC}"
  
  cat > "$PROJECT_DIR/scripts/update.sh" << EOL
#!/bin/bash

# LocalBrand Pro Update Script

# Configuration
PROJECT_DIR="$PROJECT_DIR"
BACKEND_DIR="$BACKEND_DIR"
FRONTEND_DIR="$FRONTEND_DIR"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\${BLUE}Starting LocalBrand Pro update process...\${NC}"

# Create backup
echo -e "\${BLUE}Creating database backup...\${NC}"
"$PROJECT_DIR/scripts/backup-db.sh"

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Backup failed. Aborting update.\${NC}"
  exit 1
fi

# Pull latest changes
echo -e "\${BLUE}Pulling latest changes...\${NC}"
cd "\$PROJECT_DIR"
git pull

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Failed to pull latest changes. Aborting update.\${NC}"
  exit 1
fi

# Update backend
echo -e "\${BLUE}Updating backend dependencies...\${NC}"
cd "\$BACKEND_DIR"
npm install --production

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Failed to update backend dependencies.\${NC}"
  exit 1
fi

# Update frontend
echo -e "\${BLUE}Updating frontend dependencies...\${NC}"
cd "\$FRONTEND_DIR"
npm install --production

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Failed to update frontend dependencies.\${NC}"
  exit 1
fi

# Build frontend
echo -e "\${BLUE}Building frontend...\${NC}"
cd "\$FRONTEND_DIR"
npm run build

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Failed to build frontend.\${NC}"
  exit 1
fi

# Restart services
echo -e "\${BLUE}Restarting services...\${NC}"
pm2 reload localbrand-pro-backend

echo -e "\${GREEN}Update completed successfully.\${NC}"
EOL
  
  chmod +x "$PROJECT_DIR/scripts/update.sh"
  
  echo -e "${GREEN}Update script created: $PROJECT_DIR/scripts/update.sh${NC}"
  echo ""
}

# Function to create native packages
create_native_packages() {
  echo -e "${BLUE}Setting up native package creation...${NC}"
  
  # Check if electron-packager is installed
  if ! npm list -g electron-packager > /dev/null 2>&1; then
    echo -e "${YELLOW}electron-packager is not installed. Installing...${NC}"
    npm install -g electron-packager
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install electron-packager.${NC}"
      exit 1
    fi
  fi
  
  # Create electron main file
  mkdir -p "$PROJECT_DIR/desktop"
  
  cat > "$PROJECT_DIR/desktop/main.js" << EOL
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function startBackend() {
  const backendPath = path.join(__dirname, 'backend', 'src', 'index.js');
  backendProcess = spawn('node', [backendPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '5000'
    }
  });
  
  backendProcess.stdout.on('data', (data) => {
    console.log(\`Backend: \${data}\`);
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error(\`Backend error: \${data}\`);
  });
  
  backendProcess.on('close', (code) => {
    console.log(\`Backend process exited with code \${code}\`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'frontend', 'build', 'favicon.ico')
  });
  
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'frontend', 'build', 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startBackend();
  setTimeout(createWindow, 2000); // Give backend time to start
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
EOL
  
  # Create package.json for electron app
  cat > "$PROJECT_DIR/desktop/package.json" << EOL
{
  "name": "localbrand-pro-desktop",
  "version": "1.0.0",
  "description": "LocalBrand Pro Desktop Application",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "package-mac": "electron-packager . --overwrite --platform=darwin --arch=x64 --icon=frontend/build/favicon.icns --prune=true --out=release-builds",
    "package-win": "electron-packager . --overwrite --platform=win32 --arch=x64 --icon=frontend/build/favicon.ico --prune=true --out=release-builds --version-string.CompanyName=LocalBrandPro --version-string.FileDescription=LocalBrandPro --version-string.ProductName=\"LocalBrand Pro\"",
    "package-linux": "electron-packager . --overwrite --platform=linux --arch=x64 --icon=frontend/build/favicon.png --prune=true --out=release-builds"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron": "^19.0.0"
  }
}
EOL
  
  # Create packaging script
  cat > "$PROJECT_DIR/scripts/create-packages.sh" << EOL
#!/bin/bash

# LocalBrand Pro Native Package Creation Script

# Configuration
PROJECT_DIR="$PROJECT_DIR"
DESKTOP_DIR="$PROJECT_DIR/desktop"
BACKEND_DIR="$BACKEND_DIR"
FRONTEND_DIR="$FRONTEND_DIR"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\${BLUE}Starting LocalBrand Pro package creation...\${NC}"

# Check if electron-packager is installed
if ! npm list -g electron-packager > /dev/null 2>&1; then
  echo -e "\${YELLOW}electron-packager is not installed. Installing...\${NC}"
  npm install -g electron-packager
  
  if [ \$? -ne 0 ]; then
    echo -e "\${RED}Failed to install electron-packager.\${NC}"
    exit 1
  fi
fi

# Install desktop dependencies
echo -e "\${BLUE}Installing desktop dependencies...\${NC}"
cd "\$DESKTOP_DIR"
npm install

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Failed to install desktop dependencies.\${NC}"
  exit 1
fi

# Copy backend and frontend to desktop directory
echo -e "\${BLUE}Copying backend and frontend...\${NC}"
rm -rf "\$DESKTOP_DIR/backend" "\$DESKTOP_DIR/frontend"
mkdir -p "\$DESKTOP_DIR/backend" "\$DESKTOP_DIR/frontend"

cp -r "\$BACKEND_DIR/"* "\$DESKTOP_DIR/backend/"
cp -r "\$FRONTEND_DIR/build" "\$DESKTOP_DIR/frontend/"

# Create packages
echo -e "\${BLUE}Creating packages...\${NC}"
cd "\$DESKTOP_DIR"

# Determine platform
PLATFORM=\$(uname)

if [[ "\$PLATFORM" == "Darwin" ]]; then
  echo -e "\${BLUE}Creating macOS package...\${NC}"
  npm run package-mac
elif [[ "\$PLATFORM" == "Linux" ]]; then
  echo -e "\${BLUE}Creating Linux package...\${NC}"
  npm run package-linux
else
  echo -e "\${BLUE}Creating Windows package...\${NC}"
  npm run package-win
fi

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Failed to create packages.\${NC}"
  exit 1
fi

echo -e "\${GREEN}Packages created successfully in \$DESKTOP_DIR/release-builds\${NC}"
EOL
  
  chmod +x "$PROJECT_DIR/scripts/create-packages.sh"
  
  echo -e "${GREEN}Native package setup complete.${NC}"
  echo -e "${GREEN}Package creation script: $PROJECT_DIR/scripts/create-packages.sh${NC}"
  echo ""
}

# Function to start services
start_services() {
  echo -e "${BLUE}Starting services...${NC}"
  
  # Start backend with PM2
  cd "$PROJECT_DIR"
  pm2 start ecosystem.config.js
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend service started successfully.${NC}"
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
  else
    echo -e "${RED}Failed to start backend service.${NC}"
    exit 1
  fi
  
  echo ""
}

# Function to display deployment summary
display_summary() {
  echo -e "${BLUE}Deployment Summary${NC}"
  echo "========================================"
  echo -e "Backend API: ${GREEN}http://localhost:$PORT/api${NC}"
  
  if [ -z "$DOMAIN_NAME" ]; then
    echo -e "Frontend: ${GREEN}http://localhost${NC}"
  else
    echo -e "Frontend: ${GREEN}http://$DOMAIN_NAME${NC}"
  fi
  
  echo -e "Project directory: ${GREEN}$PROJECT_DIR${NC}"
  echo -e "Backend directory: ${GREEN}$BACKEND_DIR${NC}"
  echo -e "Frontend directory: ${GREEN}$FRONTEND_DIR${NC}"
  echo ""
  echo -e "Useful commands:"
  echo -e "  - View backend logs: ${CYAN}pm2 logs localbrand-pro-backend${NC}"
  echo -e "  - Restart backend: ${CYAN}pm2 restart localbrand-pro-backend${NC}"
  echo -e "  - Update application: ${CYAN}$PROJECT_DIR/scripts/update.sh${NC}"
  echo -e "  - Backup database: ${CYAN}$PROJECT_DIR/scripts/backup-db.sh${NC}"
  echo -e "  - Create native packages: ${CYAN}$PROJECT_DIR/scripts/create-packages.sh${NC}"
  echo ""
  echo -e "${GREEN}LocalBrand Pro has been successfully deployed!${NC}"
}

# Main deployment process
main() {
  # Set directory paths
  PROJECT_DIR=$(pwd)
  BACKEND_DIR="$PROJECT_DIR/backend"
  FRONTEND_DIR="$PROJECT_DIR/frontend"
  
  echo -e "${BLUE}LocalBrand Pro will be deployed from: $PROJECT_DIR${NC}"
  echo ""
  
  # Check if backend and frontend directories exist
  if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Backend or frontend directory not found.${NC}"
    echo -e "${RED}Make sure you're running this script from the project root directory.${NC}"
    exit 1
  fi
  
  # Check and install dependencies
  check_and_install_dependencies
  
  # Configure environment
  configure_environment
  
  # Install backend dependencies
  install_backend_dependencies
  
  # Install frontend dependencies
  install_frontend_dependencies
  
  # Build frontend
  build_frontend
  
  # Setup PM2
  setup_pm2
  
  # Ask if user wants to setup Nginx
  read -p "Do you want to setup Nginx for serving the frontend? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    setup_nginx
  fi
  
  # Create backup script
  create_backup_script
  
  # Create update script
  create_update_script
  
  # Ask if user wants to create native packages
  read -p "Do you want to setup native package creation? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_native_packages
  fi
  
  # Start services
  start_services
  
  # Display deployment summary
  display_summary
}

# Run main function
main
