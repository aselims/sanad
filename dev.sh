#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default configuration
MODE="local"
SEED_DB=false
JWT_SECRET=""
OPENAI_API_KEY=""

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --remote) 
            MODE="remote"
            ;;
        --local) 
            MODE="local" 
            ;;
        --seed-db)
            SEED_DB=true
            ;;
        --jwt-secret)
            JWT_SECRET="$2"
            shift
            ;;
        --openai-key)
            OPENAI_API_KEY="$2"
            shift
            ;;
        --help) 
            echo "Usage: ./dev.sh [OPTIONS]"
            echo "Options:"
            echo "  --local              Run with local backend (default)"
            echo "  --remote             Run with remote backend"
            echo "  --seed-db            Seed the database with initial data"
            echo "  --jwt-secret VALUE   Set JWT secret for authentication"
            echo "  --openai-key VALUE   Set OpenAI API key"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
    shift
done

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    chmod +x get-docker.sh
    bash get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}Added user to docker group. You may need to log out and back in.${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose is not installed. Installing...${NC}"
    sudo apt update
    sudo apt install -y docker-compose
fi

# Create .env file if JWT_SECRET or OPENAI_API_KEY is provided
if [ ! -z "$JWT_SECRET" ] || [ ! -z "$OPENAI_API_KEY" ]; then
    echo -e "${GREEN}Creating .env file with provided credentials...${NC}"
    
    # Read existing .env if it exists
    if [ -f .env ]; then
        source .env
    fi
    
    # Use provided values or keep existing ones
    JWT_SECRET=${JWT_SECRET:-$JWT_SECRET}
    OPENAI_API_KEY=${OPENAI_API_KEY:-$OPENAI_API_KEY}
    
    # Create .env file
    cat > .env << EOL
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sanad
EOL
fi

# Select Docker Compose file based on mode
if [ "$MODE" = "remote" ]; then
    COMPOSE_FILE="docker-compose.dev-remote.yml"
    echo -e "${GREEN}Starting in remote mode using ${COMPOSE_FILE}...${NC}"
else
    COMPOSE_FILE="docker-compose.dev-local.yml"
    echo -e "${GREEN}Starting in local mode using ${COMPOSE_FILE}...${NC}"
fi

# Start containers
echo -e "${GREEN}Starting Docker containers...${NC}"
docker compose -f ${COMPOSE_FILE} down
docker compose -f ${COMPOSE_FILE} up -d --build

# Run database seed if requested
if [ "$SEED_DB" = true ]; then
    echo -e "${YELLOW}Seeding the database...${NC}"
    docker compose -f ${COMPOSE_FILE} exec -T backend node dist/scripts/seed-database.js || echo "Seed script failed - database may already be populated"
fi

echo -e "${GREEN}Development environment is up and running!${NC}"
echo -e "Use ${YELLOW}docker compose -f ${COMPOSE_FILE} logs -f${NC} to view logs"
echo -e "Use ${YELLOW}docker compose -f ${COMPOSE_FILE} down${NC} to stop the environment"

