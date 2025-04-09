#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting T3awanu production environment...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Using default environment variables.${NC}"
    # Create a minimal .env file with secure defaults
    cat > .env << EOL
DB_USERNAME=postgres
DB_PASSWORD=$(openssl rand -base64 12)
DB_DATABASE=sanad_db
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=1d
LOG_LEVEL=info
EOL
    echo -e "${GREEN}Created .env file with secure defaults.${NC}"
fi

# Start the services in production mode
echo -e "${GREEN}Starting services with Docker Compose in production mode...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Show running containers
echo -e "${GREEN}Services started. Running containers:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}T3awanu is now running in production mode. Access the application at http://localhost${NC}"
echo -e "${YELLOW}To stop the services, run: docker-compose -f docker-compose.prod.yml down${NC}"

# Exit gracefully on Ctrl+C
trap 'echo -e "${GREEN}Stopping production environment...${NC}"; docker-compose -f docker-compose.prod.yml down' INT TERM 