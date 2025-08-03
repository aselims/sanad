#!/bin/bash

# Production deployment script for Sanad on collopi.com
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (required for nginx configuration)
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. This is required for nginx configuration."
    else
        print_error "This script requires root privileges for nginx configuration."
        print_status "Please run: sudo ./deploy.sh"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx is not installed. Please install Nginx first."
        exit 1
    fi
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_warning "Certbot is not installed. SSL certificates will need to be configured manually."
    fi
    
    print_success "Prerequisites check completed."
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    if command -v certbot &> /dev/null; then
        print_status "Obtaining SSL certificate for collopi.com..."
        certbot certonly --nginx -d collopi.com -d www.collopi.com --non-interactive --agree-tos --email admin@collopi.com
        
        if [ $? -eq 0 ]; then
            print_success "SSL certificate obtained successfully."
        else
            print_warning "SSL certificate setup failed. You may need to configure it manually."
        fi
    else
        print_warning "Certbot not found. Please install SSL certificates manually."
    fi
}

# Configure nginx
configure_nginx() {
    print_status "Configuring nginx..."
    
    # Copy nginx configuration
    cp nginx.conf /etc/nginx/sites-available/collopi.com
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/collopi.com /etc/nginx/sites-enabled/collopi.com
    
    # Remove default nginx site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    nginx -t
    if [ $? -eq 0 ]; then
        print_success "Nginx configuration is valid."
        systemctl reload nginx
        print_success "Nginx reloaded successfully."
    else
        print_error "Nginx configuration test failed."
        exit 1
    fi
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env.production ]; then
        print_error ".env.production file not found!"
        print_status "Please copy .env.production.template to .env.production and configure it."
        print_status "cp .env.production.template .env.production"
        print_status "Then edit .env.production with your actual values."
        exit 1
    fi
    
    # Load environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    print_success "Environment configured."
}

# Deploy application
deploy_application() {
    print_status "Deploying Sanad application..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build and start containers
    print_status "Building and starting containers..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are healthy
    check_health
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts..."
        
        # Check backend health
        if curl -f http://127.0.0.1:8081/api/health &> /dev/null; then
            print_success "Backend is healthy."
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Backend health check failed after $max_attempts attempts."
            print_status "Checking logs..."
            docker-compose -f docker-compose.prod.yml logs backend
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Check frontend health
    if curl -f http://127.0.0.1:8080/health &> /dev/null; then
        print_success "Frontend is healthy."
    else
        print_error "Frontend health check failed."
        print_status "Checking logs..."
        docker-compose -f docker-compose.prod.yml logs frontend
        exit 1
    fi
    
    print_success "All services are healthy."
}

# Setup log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    cat > /etc/logrotate.d/sanad << EOF
/var/log/nginx/collopi.*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        systemctl reload nginx
    endscript
}
EOF
    
    print_success "Log rotation configured."
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up basic monitoring..."
    
    # Create a simple monitoring script
    cat > /usr/local/bin/sanad-monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script for Sanad

LOGFILE="/var/log/sanad-monitor.log"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Check if containers are running
if ! docker-compose -f /opt/sources/sanad/docker-compose.prod.yml ps | grep -q "Up"; then
    echo "[$timestamp] ERROR: Some containers are not running" >> $LOGFILE
    docker-compose -f /opt/sources/sanad/docker-compose.prod.yml up -d
fi

# Check if website is responding
if ! curl -f https://collopi.com/health &> /dev/null; then
    echo "[$timestamp] ERROR: Website is not responding" >> $LOGFILE
fi
EOF
    
    chmod +x /usr/local/bin/sanad-monitor.sh
    
    # Add to crontab to run every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/sanad-monitor.sh") | crontab -
    
    print_success "Basic monitoring configured."
}

# Main deployment function
main() {
    print_status "Starting Sanad deployment for collopi.com..."
    
    check_root
    check_prerequisites
    setup_environment
    deploy_application
    configure_nginx
    setup_ssl
    setup_log_rotation
    setup_monitoring
    
    print_success "Deployment completed successfully!"
    print_status "Your application should now be available at: https://collopi.com"
    print_status ""
    print_status "Useful commands:"
    print_status "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
    print_status "  - Check status: docker-compose -f docker-compose.prod.yml ps"
    print_status "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
    print_status "  - Monitor logs: tail -f /var/log/nginx/collopi.access.log"
}

# Run main function
main "$@"