#!/bin/bash
set -e

# Configuration
DOMAIN="sanad.selimsalman.de"
EMAIL="admin@selimsalman.de"
REPO_URL="https://github.com/aselims/sanad.git"
REPO_BRANCH="main"
APP_DIR="$HOME/sanad"

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment for $DOMAIN...${NC}"

# Check for required packages
echo -e "${YELLOW}Checking required packages...${NC}"
if ! command -v docker &> /dev/null; then
  echo "Docker not found. Installing..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  chmod +x get-docker.sh
  bash get-docker.sh
  sudo usermod -aG docker $USER
  echo "Added user to docker group. You may need to log out and back in."
fi

if ! command -v docker-compose &> /dev/null; then
  echo "Docker Compose not found. Installing..."
  sudo apt update
  sudo apt install -y docker-compose
fi

if ! command -v apache2ctl &> /dev/null; then
  echo "Apache2 not found. Installing..."
  sudo apt update
  sudo apt install -y apache2
fi

# Enable required Apache modules
echo -e "${YELLOW}Enabling Apache modules...${NC}"
sudo a2enmod proxy proxy_http proxy_wstunnel ssl rewrite

# Create or update application directory
echo -e "${YELLOW}Setting up repository...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or update repository
if [ -d ".git" ]; then
  echo "Repository exists. Updating..."
  git fetch origin $REPO_BRANCH
  git reset --hard origin/$REPO_BRANCH
else
  echo "Cloning repository..."
  git init
  git remote add origin $REPO_URL
  git fetch origin $REPO_BRANCH
  git reset --hard origin/$REPO_BRANCH
fi

# Create .env file
echo -e "${YELLOW}Creating environment variables...${NC}"
read -p "Enter JWT_SECRET: " JWT_SECRET
read -p "Enter OPENAI_API_KEY: " OPENAI_API_KEY

cat > .env << EOL
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sanad
EOL

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose -f docker-compose.dev.yml up -d --build

# Set up Apache virtual host for HTTP initially
echo -e "${YELLOW}Setting up Apache configuration...${NC}"
sudo tee /etc/apache2/sites-available/$DOMAIN.conf > /dev/null << EOL
<VirtualHost *:80>
    ServerName $DOMAIN
    
    # Frontend proxy
    ProxyPreserveHost On
    ProxyPass / http://localhost:8081/
    ProxyPassReverse / http://localhost:8081/
    
    # API proxy
    ProxyPass /api http://localhost:3001/
    ProxyPassReverse /api http://localhost:3001/
    
    ErrorLog \${APACHE_LOG_DIR}/$DOMAIN-error.log
    CustomLog \${APACHE_LOG_DIR}/$DOMAIN-access.log combined
</VirtualHost>
EOL

# Enable site
sudo a2ensite $DOMAIN.conf
sudo systemctl reload apache2

# Install and run Certbot for SSL
echo -e "${YELLOW}Setting up SSL with Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
  sudo apt update
  sudo apt install -y certbot python3-certbot-apache
fi

# Get SSL certificate
sudo certbot --apache -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# Create a more complete SSL config (in case Certbot's isn't sufficient)
sudo tee /etc/apache2/sites-available/$DOMAIN-le-ssl.conf > /dev/null << EOL
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName $DOMAIN
    
    # Frontend proxy
    ProxyPreserveHost On
    ProxyPass / http://localhost:8081/
    ProxyPassReverse / http://localhost:8081/
    
    # API proxy
    ProxyPass /api http://localhost:3001/
    ProxyPassReverse /api http://localhost:3001/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)  ws://localhost:8081/$1 [P,L]
    
    ErrorLog \${APACHE_LOG_DIR}/$DOMAIN-error.log
    CustomLog \${APACHE_LOG_DIR}/$DOMAIN-access.log combined
    
    Include /etc/letsencrypt/options-ssl-apache.conf
    SSLCertificateFile /etc/letsencrypt/live/$DOMAIN/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/$DOMAIN/privkey.pem
</VirtualHost>
</IfModule>
EOL

# Reload Apache after configuration update
sudo systemctl reload apache2

echo -e "${GREEN}Deployment complete! Site is available at https://$DOMAIN${NC}"
echo "You can check Docker container status with: docker ps"
echo "View logs with: docker-compose -f docker-compose.dev.yml logs -f" 