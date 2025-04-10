# T3awanu Project

## Project Overview
T3awanu is a collaborative platform that connects innovators, experts, and partners.

## Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)

## Running the Application

### Development Environment
The development environment includes hot-reloading for both frontend and backend, and is configured for debugging.

```bash
# Start the development environment
./dev.sh
# or
docker-compose up
```

This will:
- Start the PostgreSQL database on port 5432
- Start the backend API server on port 3000 with hot-reloading
- Start the frontend development server on port 5173 with hot-reloading

### Production Environment
The production environment is optimized for performance and security.

```bash
# Start the production environment
./prod.sh
# or
docker-compose -f docker-compose.prod.yml up -d
```

This will:
- Start the PostgreSQL database (not exposed to host)
- Start the backend API server (not exposed to host)
- Start the frontend server on port 80 with Nginx

## Deployment Options

### Local Deployment
You can deploy the application locally using the provided scripts:
- `./dev.sh` for development
- `./prod.sh` for production

Simple usage: ./dev.sh --local or ./dev.sh --remote
No .env file editing required to switch modes
Custom remote URL support: ./dev.sh --remote https://custom-api.example.com
Help documentation built in: ./dev.sh --help
Clean state management: Creates/removes override files automatically
Explicit feedback showing which mode is active
Default behavior (local mode) when run without parameters
You can run it with:
./dev.sh (defaults to local)
./dev.sh --local (explicitly local)
./dev.sh --remote (uses default remote URL)
./dev.sh --remote https://custom-url.com (uses custom remote URL)
This eliminates any manual configuration steps while providing total flexibility.


## Environment Variables
The application uses environment variables for configuration. For production, create a `.env` file in the project root with the following variables:

```env
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=sanad_db
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
LOG_LEVEL=info
```

## Project Structure
- `/frontend`: React frontend application
- `/backend`: Node.js Express backend API
- `/docs`: Project documentation
- `docker-compose.yml`: Development environment configuration
- `docker-compose.prod.yml`: Production environment configuration
- `dev.sh`: Script to start the development environment
- `prod.sh`: Script to start the production environment

## CI/CD Integration
The Docker setup is compatible with various CI/CD platforms:

### GitHub Actions
Create a `.github/workflows/deploy.yml` file with:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build and push Docker images
      run: |
        docker-compose -f docker-compose.prod.yml build
        # Add steps to push to your container registry and deploy
```

## Troubleshooting
- **Database connection issues**: Ensure the PostgreSQL service is running with `docker-compose ps`
- **Container startup failures**: Check logs with `docker-compose logs -f [service_name]`
- **Performance issues**: For production, ensure you're using `docker-compose.prod.yml` not the development configuration
- **Data persistence**: All data is stored in Docker volumes; back them up regularly

## Best Practices
- Keep environment variables secure and never commit them to version control
- Regularly update your Docker images to get security patches
- Back up your database volumes regularly
- Monitor your application's performance and logs 