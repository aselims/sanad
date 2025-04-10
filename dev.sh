#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to local mode
MODE="local"
REMOTE_URL=""
USE_DEV_COMPOSE=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --remote) 
            MODE="remote"
            REMOTE_URL="${2:-https://sanad.selimsalman.de}"
            if [[ $2 != --* && $2 != "" ]]; then
                shift
            fi
            ;;
        --local) 
            MODE="local" 
            ;;
        --dev-compose)
            USE_DEV_COMPOSE=true
            ;;
        --help) 
            echo "Usage: ./dev.sh [--local | --remote [URL]] [--dev-compose]"
            echo "  --local        Run with local backend (default)"
            echo "  --remote       Run with remote backend at Sanad.selimsalman.de"
            echo "                 or specify a different URL"
            echo "  --dev-compose  Use docker-compose.dev.yml instead of docker-compose.yml"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo -e "${GREEN}Starting T3awanu development environment in ${MODE} mode...${NC}"
if [ "$USE_DEV_COMPOSE" = true ]; then
    echo -e "${GREEN}Using docker-compose.dev.yml configuration...${NC}"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Set compose file based on flag
COMPOSE_FILE="docker-compose.yml"
if [ "$USE_DEV_COMPOSE" = true ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
fi

# Create docker-compose config based on mode
if [ "$MODE" = "remote" ]; then
    echo -e "${GREEN}Configuring frontend to use remote backend at ${REMOTE_URL}${NC}"
    
    # Create docker-compose.override.yml for remote mode
    cat > docker-compose.override.yml << EOL
version: '3.8'
services:
  frontend:
    environment:
      - VITE_API_URL=${REMOTE_URL}
EOL
    
    # Start only frontend
    docker compose -f ${COMPOSE_FILE} up frontend
else
    echo -e "${GREEN}Starting complete local development environment${NC}"
    
    # Remove any existing override file
    if [ -f docker-compose.override.yml ]; then
        rm docker-compose.override.yml
    fi
    
    # Build backend with no cache
    echo -e "${GREEN}Building backend with no cache to ensure correct native module compilation...${NC}"
    docker compose -f ${COMPOSE_FILE} build --no-cache backend
    
    # Start all services
    docker compose -f ${COMPOSE_FILE} up
fi

# Exit gracefully on Ctrl+C
trap 'echo -e "${GREEN}Stopping development environment...${NC}"; docker compose -f ${COMPOSE_FILE} down; if [ -f docker-compose.override.yml ]; then rm docker-compose.override.yml; fi' INT TERM EXIT 