# Sanad Production Deployment Guide for collopi.com

This guide provides step-by-step instructions for deploying the Sanad application to collopi.com using secure Docker containers and Nginx reverse proxy.

## Security Improvements Made

### 🔒 Docker Security Updates
- **Updated Node.js**: Upgraded from vulnerable `node:18-alpine` to secure `node:20-alpine`
- **Updated Nginx**: Using latest stable `nginx:1.26-alpine`
- **Non-root containers**: All containers run as non-root users
- **Resource limits**: Memory and CPU limits configured
- **Health checks**: Comprehensive health monitoring for all services

### 🛡️ Infrastructure Security
- **SSL/TLS**: Full HTTPS with Let's Encrypt certificates
- **Rate limiting**: API and general request rate limiting
- **Security headers**: HSTS, CSP, and other security headers
- **Network isolation**: Containers communicate through isolated bridge network
- **Localhost binding**: Services only exposed to localhost, not public interfaces

## Prerequisites

### System Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Docker 24.0+ and Docker Compose 2.0+
- Nginx 1.20+
- Certbot for SSL certificates
- Root access for system configuration

### Domain Configuration
- Domain `collopi.com` pointing to your server's IP address
- DNS A records for both `collopi.com` and `www.collopi.com`

## Pre-Deployment Setup

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Install Nginx
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Restart to apply group changes
sudo reboot
```

### 2. Configure Environment

```bash
# Navigate to application directory
cd /opt/sources/sanad

# Create production environment file
cp .env.production.template .env.production

# Edit with your actual values
nano .env.production
```

**Required Environment Variables:**
```env
DB_PASSWORD=your_secure_database_password_here
JWT_SECRET=your_jwt_secret_key_here_minimum_64_characters_long_and_random
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_64_characters_long_and_random
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Generate Secure Secrets

```bash
# Generate secure passwords and secrets
echo "DB_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64)"
```

## Deployment Process

### Automated Deployment (Recommended)

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run automated deployment
sudo ./deploy.sh
```

The automated script will:
1. Check prerequisites
2. Configure environment
3. Deploy Docker containers
4. Configure Nginx reverse proxy
5. Set up SSL certificates
6. Configure monitoring and log rotation

### Manual Deployment (Step-by-step)

If you prefer manual control:

#### 1. Deploy Docker Containers

```bash
# Stop any existing containers
docker-compose -f docker-compose.prod.yml down

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

#### 2. Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/collopi.com

# Enable the site
sudo ln -sf /etc/nginx/sites-available/collopi.com /etc/nginx/sites-enabled/collopi.com

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

#### 3. Setup SSL Certificates

```bash
# Obtain SSL certificate
sudo certbot --nginx -d collopi.com -d www.collopi.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Verification Steps

### 1. Service Health Checks

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check container logs
docker-compose -f docker-compose.prod.yml logs -f

# Test backend API
curl -f http://127.0.0.1:8081/api/health

# Test frontend
curl -f http://127.0.0.1:8080/health
```

### 2. External Access Tests

```bash
# Test HTTP to HTTPS redirect
curl -I http://collopi.com

# Test HTTPS access
curl -I https://collopi.com

# Test API endpoint
curl -I https://collopi.com/api/health

# Test SSL certificate
echo | openssl s_client -connect collopi.com:443 -servername collopi.com 2>/dev/null | openssl x509 -noout -dates
```

### 3. Security Verification

```bash
# Check SSL rating (external)
curl -s "https://api.ssllabs.com/api/v3/analyze?host=collopi.com&startNew=on"

# Verify security headers
curl -I https://collopi.com

# Check for open ports
nmap -p 80,443,8080,8081 localhost
```

## File Structure

After deployment, your file structure should look like:

```
/opt/sources/sanad/
├── backend/
│   ├── Dockerfile              # Secure Node.js 20 Alpine
│   ├── package.json
│   └── src/
├── frontend/
│   ├── Dockerfile              # Secure Node.js 20 Alpine + Nginx 1.26
│   ├── nginx.conf              # Frontend nginx config
│   ├── package.json
│   └── src/
├── Quarantine/                 # Old configurations moved here
│   └── docker-configs/
│       ├── Dockerfile.frontend-old
│       ├── Dockerfile.backend-old
│       └── nginx.conf.frontend-old
├── docker-compose.prod.yml     # Production containers
├── nginx.conf                  # Main reverse proxy config
├── .env.production.template    # Environment template
├── .env.production            # Your actual environment (not in git)
├── deploy.sh                  # Automated deployment script
└── DEPLOYMENT.md              # This guide
```

## Port Configuration

- **Frontend Container**: Port 80 → Host 127.0.0.1:8080
- **Backend Container**: Port 3000 → Host 127.0.0.1:8081
- **Database Container**: Port 5432 → Host 127.0.0.1:5432
- **Nginx Reverse Proxy**: Ports 80, 443 → Public access

## Maintenance Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Nginx logs
sudo tail -f /var/log/nginx/collopi.access.log
sudo tail -f /var/log/nginx/collopi.error.log
```

### Restart Services
```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Restart nginx
sudo systemctl restart nginx
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check health
curl -f https://collopi.com/health
```

### Database Operations
```bash
# Access database
docker-compose -f docker-compose.prod.yml exec database psql -U sanad_user -d sanad

# Backup database
docker-compose -f docker-compose.prod.yml exec database pg_dump -U sanad_user sanad > backup.sql

# View database logs
docker-compose -f docker-compose.prod.yml logs database
```

## Monitoring and Alerts

The deployment includes basic monitoring:

- **Health checks**: Automated container health monitoring
- **Log rotation**: Nginx logs rotated daily
- **Basic monitoring**: Cron job checks service status every 5 minutes
- **Monitoring logs**: `/var/log/sanad-monitor.log`

### Enhanced Monitoring (Optional)

For production environments, consider adding:
- **Prometheus + Grafana**: Metrics and dashboards
- **ELK Stack**: Centralized logging
- **Uptime monitoring**: External service monitoring
- **Alert manager**: Email/SMS alerts for downtime

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 8080, 8081 are not used by other services
2. **SSL certificate issues**: Check DNS propagation and certificate paths
3. **Container startup failures**: Check logs and environment variables
4. **Database connection issues**: Verify database credentials and network connectivity

### Debug Commands

```bash
# Check port usage
sudo netstat -tlnp | grep -E ':80|:443|:8080|:8081'

# Check docker networks
docker network ls
docker network inspect sanad_sanad-network

# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Check nginx configuration
sudo nginx -t
sudo nginx -T
```

## Security Considerations

1. **Firewall**: Configure UFW to only allow ports 22, 80, 443
2. **SSH**: Use key-based authentication, disable password login
3. **Updates**: Regularly update system packages and rebuild containers
4. **Backups**: Implement automated database and file backups
5. **Monitoring**: Set up intrusion detection and log monitoring

## Performance Optimization

1. **CDN**: Consider using Cloudflare for static asset delivery
2. **Caching**: Implement Redis for session and API caching
3. **Database**: Optimize PostgreSQL configuration for your workload
4. **Load balancing**: Scale horizontally with multiple backend instances

---

## Support

For deployment issues or questions:
- Check logs first: `docker-compose -f docker-compose.prod.yml logs -f`
- Verify environment configuration: `.env.production`
- Test individual components: Backend, Frontend, Database
- Review nginx configuration: `/etc/nginx/sites-available/collopi.com`

**Security Note**: Keep your `.env.production` file secure and never commit it to version control.