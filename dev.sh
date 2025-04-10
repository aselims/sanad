#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting T3awanu development environment...${NC}"

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

# Force a clean rebuild of the backend to ensure native modules are built correctly
echo -e "${GREEN}Building backend with no cache to ensure correct native module compilation...${NC}"
docker-compose build --no-cache backend

# Start the services
echo -e "${GREEN}Starting services with Docker Compose...${NC}"
docker-compose up

# Exit gracefully on Ctrl+C
trap 'echo -e "${GREEN}Stopping development environment...${NC}"; docker-compose down' INT TERM EXIT 