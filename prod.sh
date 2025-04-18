#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print banner
echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}              SANAD PRODUCTION DEPLOYMENT SCRIPT               ${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}Starting Sanad production environment deployment...${NC}"
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Beginning deployment process"

# Check if Docker is installed
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Checking for Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed. Please install Docker first.${NC}"
    echo -e "${YELLOW}Visit https://docs.docker.com/get-docker/ for installation instructions.${NC}"
    exit 1
else
    echo -e "${GREEN}Docker found:${NC} $(docker --version)"
fi

# Check if Docker Compose is installed
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Checking for Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}ERROR: Docker Compose plugin is not installed. Please install it first.${NC}"
    echo -e "${YELLOW}Visit https://docs.docker.com/compose/install/ for installation instructions.${NC}"
    exit 1
else
    echo -e "${GREEN}Docker Compose found:${NC} $(docker compose version | head -n 1)"
fi

# Check if .env file exists
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Checking for environment configuration..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating one with secure defaults.${NC}"
    # Create a minimal .env file with secure defaults
    DB_PASSWORD=$(openssl rand -base64 12)
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${BLUE}Generated secure database password and JWT secret${NC}"
    
    cat > .env << EOL
DB_USERNAME=postgres
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=sanad
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=your_openai_api_key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://usaned.local
LOG_LEVEL=info
EOL
    echo -e "${GREEN}Created .env file with secure defaults at:${NC} $(pwd)/.env"
    echo -e "${YELLOW}NOTE: OPENAI_API_KEY is set to default. Some AI features may be limited.${NC}"
else
    echo -e "${GREEN}Found existing .env file at:${NC} $(pwd)/.env"
    
    # Validate critical environment variables
    source .env
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Validating environment variables..."
    MISSING_VARS=0
    
    if [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_DATABASE" ]; then
        echo -e "${RED}ERROR: Missing database configuration in .env file.${NC}"
        echo -e "${YELLOW}Required variables: DB_USERNAME, DB_PASSWORD, DB_DATABASE${NC}"
        MISSING_VARS=1
    else
        echo -e "${GREEN}Database configuration:${NC} $DB_USERNAME@postgres:5432/$DB_DATABASE"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}ERROR: Missing JWT_SECRET in .env file.${NC}"
        MISSING_VARS=1
    else
        echo -e "${GREEN}JWT configuration:${NC} Secret is set, expires in ${JWT_EXPIRES_IN:-1d}"
    fi
    
    if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" == "your_openai_api_key" ]; then
        echo -e "${YELLOW}Warning: OPENAI_API_KEY not set or using default value.${NC}"
        echo -e "${YELLOW}Some AI features may not work properly.${NC}"
    else
        echo -e "${GREEN}OpenAI API:${NC} Key is configured"
    fi
    
    if [ -z "$CORS_ORIGIN" ]; then
        echo -e "${YELLOW}CORS_ORIGIN not set. Setting to https://usaned.local${NC}"
        echo "CORS_ORIGIN=https://usaned.local" >> .env
    else
        echo -e "${GREEN}CORS configuration:${NC} $CORS_ORIGIN"
    fi
    
    if [ $MISSING_VARS -eq 1 ]; then
        echo -e "${RED}Please update your .env file with the missing values and run this script again.${NC}"
        exit 1
    fi
fi

# Checking free disk space
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Checking system resources..."
DISK_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}Available disk space:${NC} $DISK_SPACE"

# Memory check
if command -v free &> /dev/null; then
    MEM_AVAIL=$(free -h | awk '/^Mem:/ {print $7}')
    echo -e "${GREEN}Available memory:${NC} $MEM_AVAIL"
fi

# Create a backup of the database if needed
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Checking for existing database data..."
if [ -d "./volumes/postgres_data" ]; then
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    echo -e "${GREEN}Found existing database data. Creating backup...${NC}"
    
    # Check if the postgres container is running
    if docker ps | grep -q "sanad_postgres"; then
        echo -e "${BLUE}Running database backup...${NC}"
        docker compose -f docker-compose.prod.yml exec postgres pg_dump -U ${DB_USERNAME:-postgres} ${DB_DATABASE:-sanad} > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
        echo -e "${GREEN}Database backup created at:${NC} $(pwd)/$BACKUP_DIR/backup_$TIMESTAMP.sql"
        echo -e "${GREEN}Backup size:${NC} $(du -h $BACKUP_DIR/backup_$TIMESTAMP.sql | cut -f1)"
    else
        echo -e "${YELLOW}No running postgres container found. Skipping database backup.${NC}"
    fi
else
    echo -e "${BLUE}No existing database data found. This appears to be a fresh installation.${NC}"
fi

# Check for any stopped containers with the same names
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Checking for existing containers..."
EXISTING_CONTAINERS=$(docker ps -a | grep -e "sanad_frontend" -e "sanad_backend" -e "sanad_postgres" | wc -l)
if [ $EXISTING_CONTAINERS -gt 0 ]; then
    echo -e "${YELLOW}Found $EXISTING_CONTAINERS existing containers. Cleaning up...${NC}"
    docker compose -f docker-compose.prod.yml down
    echo -e "${GREEN}Cleanup complete.${NC}"
else
    echo -e "${GREEN}No existing containers found.${NC}"
fi

# Pull latest Docker images
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Pulling latest base Docker images...${NC}"
docker pull postgres:14-alpine
echo -e "${GREEN}Latest PostgreSQL image pulled.${NC}"

# Build and start the services in production mode
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Building application Docker images...${NC}"
echo -e "${CYAN}This may take several minutes. Please be patient.${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Show running containers
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Checking service status...${NC}"
docker compose -f docker-compose.prod.yml ps

# Perform health checks
echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} Performing health checks...${NC}"
echo -e "${YELLOW}Waiting for services to initialize (10 seconds)...${NC}"
sleep 10 # Give services time to start up

echo -e "${BLUE}Checking frontend health...${NC}"
if curl -s --head --fail http://localhost/health > /dev/null; then
    echo -e "${GREEN}Frontend health check: PASSED${NC}"
else
    echo -e "${YELLOW}Frontend health check: FAILED${NC}"
    echo -e "${YELLOW}This could be due to the service still starting up.${NC}"
    echo -e "${YELLOW}You can view logs with: docker compose -f docker-compose.prod.yml logs frontend${NC}"
fi

echo -e "${BLUE}Checking backend health...${NC}"
if curl -s --head --fail http://localhost/api/health > /dev/null; then
    echo -e "${GREEN}Backend health check: PASSED${NC}"
else
    echo -e "${YELLOW}Backend health check: FAILED${NC}"
    echo -e "${YELLOW}This could be due to the service still starting up.${NC}"
    echo -e "${YELLOW}You can view logs with: docker compose -f docker-compose.prod.yml logs backend${NC}"
fi

echo -e "${BLUE}Checking database connection...${NC}"
if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U ${DB_USERNAME:-postgres} > /dev/null; then
    echo -e "${GREEN}Database health check: PASSED${NC}"
else
    echo -e "${YELLOW}Database health check: FAILED${NC}"
    echo -e "${YELLOW}You can view logs with: docker compose -f docker-compose.prod.yml logs postgres${NC}"
fi

# Print summary
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}Sanad is now running in production mode.${NC}"
echo -e "${GREEN}Access the application at: https://usaned.local${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${BLUE}USEFUL COMMANDS:${NC}"
echo -e "${YELLOW}View all logs:${NC} docker compose -f docker-compose.prod.yml logs -f"
echo -e "${YELLOW}View specific service logs:${NC} docker compose -f docker-compose.prod.yml logs -f [service]"
echo -e "${YELLOW}Stop all services:${NC} docker compose -f docker-compose.prod.yml down"
echo -e "${YELLOW}Restart a service:${NC} docker compose -f docker-compose.prod.yml restart [service]"
echo -e "${CYAN}================================================================${NC}"

# Add a note about DNS setup
echo -e "${BLUE}DNS CONFIGURATION:${NC}"
echo -e "${YELLOW}Ensure your DNS or hosts file includes an entry for usaned.local pointing to your server IP.${NC}"
echo -e "${YELLOW}On local machine, add to /etc/hosts: 127.0.0.1 usaned.local${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}Deployment completed at:${NC} $(date '+%Y-%m-%d %H:%M:%S')"

# Exit gracefully on Ctrl+C
trap 'echo -e "${RED}Deployment interrupted. Stopping services...${NC}"; docker compose -f docker-compose.prod.yml down; echo -e "${GREEN}Services stopped.${NC}"' INT TERM 