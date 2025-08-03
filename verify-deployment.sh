#!/bin/bash

# Deployment verification script for Sanad on collopi.com
# This script checks if all services are working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check Docker containers
check_containers() {
    print_status "Checking Docker containers..."
    
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Docker containers are running"
        docker-compose -f docker-compose.prod.yml ps
    else
        print_error "Some Docker containers are not running"
        docker-compose -f docker-compose.prod.yml ps
        return 1
    fi
}

# Check internal services
check_internal_services() {
    print_status "Checking internal service health..."
    
    # Check backend
    if curl -f http://127.0.0.1:8081/api/health &> /dev/null; then
        print_success "Backend service is healthy (127.0.0.1:8081)"
    else
        print_error "Backend service is not responding"
        return 1
    fi
    
    # Check frontend
    if curl -f http://127.0.0.1:8080/health &> /dev/null; then
        print_success "Frontend service is healthy (127.0.0.1:8080)"
    else
        print_error "Frontend service is not responding"
        return 1
    fi
}

# Check nginx configuration
check_nginx() {
    print_status "Checking Nginx configuration..."
    
    if nginx -t &> /dev/null; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
        nginx -t
        return 1
    fi
    
    # Check if nginx is running
    if systemctl is-active --quiet nginx; then
        print_success "Nginx service is running"
    else
        print_error "Nginx service is not running"
        return 1
    fi
}

# Check external access
check_external_access() {
    print_status "Checking external access..."
    
    # Check HTTP redirect
    if curl -s -o /dev/null -w "%{http_code}" http://collopi.com | grep -q "301\|302"; then
        print_success "HTTP to HTTPS redirect is working"
    else
        print_warning "HTTP to HTTPS redirect may not be working"
    fi
    
    # Check HTTPS access
    if curl -f https://collopi.com/health &> /dev/null; then
        print_success "HTTPS access is working (https://collopi.com)"
    else
        print_error "HTTPS access is not working"
        return 1
    fi
    
    # Check API access
    if curl -f https://collopi.com/api/health &> /dev/null; then
        print_success "API access is working (https://collopi.com/api)"
    else
        print_error "API access is not working"
        return 1
    fi
}

# Check SSL certificate
check_ssl() {
    print_status "Checking SSL certificate..."
    
    if echo | openssl s_client -connect collopi.com:443 -servername collopi.com 2>/dev/null | openssl x509 -noout -dates; then
        print_success "SSL certificate is valid"
    else
        print_warning "SSL certificate check failed or not configured"
    fi
}

# Check security headers
check_security_headers() {
    print_status "Checking security headers..."
    
    local headers=$(curl -s -I https://collopi.com)
    
    if echo "$headers" | grep -q "Strict-Transport-Security"; then
        print_success "HSTS header is present"
    else
        print_warning "HSTS header is missing"
    fi
    
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        print_success "X-Content-Type-Options header is present"
    else
        print_warning "X-Content-Type-Options header is missing"
    fi
    
    if echo "$headers" | grep -q "X-Frame-Options"; then
        print_success "X-Frame-Options header is present"
    else
        print_warning "X-Frame-Options header is missing"
    fi
}

# Check disk space
check_disk_space() {
    print_status "Checking disk space..."
    
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        print_success "Disk space is adequate ($disk_usage% used)"
    elif [ "$disk_usage" -lt 90 ]; then
        print_warning "Disk space is getting low ($disk_usage% used)"
    else
        print_error "Disk space is critically low ($disk_usage% used)"
    fi
}

# Check memory usage
check_memory() {
    print_status "Checking memory usage..."
    
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$mem_usage" -lt 80 ]; then
        print_success "Memory usage is normal ($mem_usage% used)"
    elif [ "$mem_usage" -lt 90 ]; then
        print_warning "Memory usage is high ($mem_usage% used)"
    else
        print_error "Memory usage is critically high ($mem_usage% used)"
    fi
}

# Check log files
check_logs() {
    print_status "Checking recent log files..."
    
    # Check for recent errors in nginx logs
    if [ -f /var/log/nginx/collopi.error.log ]; then
        local error_count=$(tail -n 100 /var/log/nginx/collopi.error.log | grep -c "error\|critical" || true)
        if [ "$error_count" -eq 0 ]; then
            print_success "No recent errors in nginx logs"
        else
            print_warning "Found $error_count recent errors in nginx logs"
        fi
    else
        print_warning "Nginx error log not found"
    fi
    
    # Check container logs for errors
    local container_errors=$(docker-compose -f docker-compose.prod.yml logs --tail=50 2>&1 | grep -c -i "error\|fatal\|exception" || true)
    if [ "$container_errors" -eq 0 ]; then
        print_success "No recent errors in container logs"
    else
        print_warning "Found $container_errors recent errors in container logs"
    fi
}

# Main verification function
main() {
    echo ""
    echo "🔍 Sanad Deployment Verification for collopi.com"
    echo "================================================"
    echo ""
    
    local failed_checks=0
    
    # Run all checks
    check_containers || ((failed_checks++))
    echo ""
    
    check_internal_services || ((failed_checks++))
    echo ""
    
    check_nginx || ((failed_checks++))
    echo ""
    
    check_external_access || ((failed_checks++))
    echo ""
    
    check_ssl
    echo ""
    
    check_security_headers
    echo ""
    
    check_disk_space
    echo ""
    
    check_memory
    echo ""
    
    check_logs
    echo ""
    
    # Summary
    echo "📊 Verification Summary"
    echo "======================"
    
    if [ "$failed_checks" -eq 0 ]; then
        print_success "All critical checks passed! 🎉"
        print_status "Your Sanad application is successfully deployed at https://collopi.com"
    else
        print_error "$failed_checks critical check(s) failed!"
        print_status "Please review the failed checks above and fix any issues."
        exit 1
    fi
    
    echo ""
    print_status "Useful commands:"
    print_status "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
    print_status "  - Check status: docker-compose -f docker-compose.prod.yml ps"
    print_status "  - Restart: docker-compose -f docker-compose.prod.yml restart"
    print_status "  - Monitor: tail -f /var/log/nginx/collopi.access.log"
}

# Run verification
main "$@"