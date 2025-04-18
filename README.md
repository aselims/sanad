# Sanad - Innovation Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/aselims/sanad/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/aselims/sanad/actions/workflows/ci-cd.yml)

Sanad is an open-source innovation collaboration platform that connects innovators, researchers, startups, and investors to foster collaboration and drive innovation forward.

## Features

- **AI-Powered Matchmaking**: Intelligent matching system to connect compatible innovators
- **Role-Based Profiles**: Specialized profiles for different types of innovators (Startups, Researchers, Investors, etc.)
- **Collaboration Tools**: Built-in tools for managing collaborations and partnerships
- **Real-time Messaging**: Secure communication between users
- **Challenge Management**: Platform for posting and managing innovation challenges
- **Resource Sharing**: Secure file sharing and collaboration space

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with TypeScript
- Express.js
- TypeORM for database management
- PostgreSQL database
- JWT for authentication
- OpenAI integration for AI features

### Infrastructure
- Docker for containerization
- Nginx as reverse proxy
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- [Docker](https://docs.docker.com/get-docker/) (version 20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0.0 or higher)

## Building and Deploying the Application

### Local Development

You can run the application in development mode with both local or remote backend options.

#### 1. Clone the repository
```bash
git clone https://github.com/aselims/sanad.git
cd sanad
```

#### 2. Development with Docker (Recommended)

The easiest way to start development is using the provided `dev.sh` script:

```bash
# Start with local backend (default)
./dev.sh

# OR start with explicit options
./dev.sh --local

# Start with remote backend
./dev.sh --remote

# Seed the database with initial data
./dev.sh --local --seed-db
```

This script automatically:
- Checks for Docker installation
- Creates necessary environment files
- Starts the application with hot-reloading for both frontend and backend
- Sets up the database

#### 3. Manual Development Setup

If you prefer to run components individually:

```bash
# Install frontend dependencies
cd frontend
npm install
npm run dev

# In a separate terminal, install backend dependencies
cd backend
npm install
npm run dev
```

### Building for Production

#### 1. Building the Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist` directory with optimized static files.

#### 2. Building the Backend

```bash
cd backend
npm install
npm run build
```

This compiles TypeScript to JavaScript in a `dist` directory.

### Production Deployment

The application can be easily deployed in production using Docker:

#### 1. Using the Production Script (Recommended)

The included `prod.sh` script handles the entire deployment process:

```bash
./prod.sh
```

This script:
- Verifies prerequisites
- Creates/validates environment configuration
- Performs system resource checks
- Creates database backups if needed
- Builds and deploys all containers
- Runs health checks
- Provides deployment status

#### 2. Manual Production Deployment

```bash
# Configuration setup
cp .env.example .env
# Edit .env with your production values

# Start the production stack
docker compose -f docker-compose.prod.yml up -d --build
```

#### Production Environment Variables

Create a `.env` file with the following variables:
```
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=sanad
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info
```

### Managing the Production Deployment

- **View logs**: `docker compose -f docker-compose.prod.yml logs -f`
- **Stop the application**: `docker compose -f docker-compose.prod.yml down`
- **Restart components**: `docker compose -f docker-compose.prod.yml restart [service]`
- **Update to new version**:
  ```bash
  git pull
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml up -d --build
  ```

### DNS Configuration

For local development, add this entry to your `/etc/hosts` file:
```
127.0.0.1 usaned.local
```

For production, ensure your DNS points to your server IP.

## Troubleshooting

- **Database connection issues**: Ensure PostgreSQL is running with `docker compose ps`
- **Container failures**: Check logs with `docker compose logs -f [service_name]`
- **Permission issues**: The scripts require execution permissions (`chmod +x dev.sh prod.sh`)
- **Build failures**: Check that local Node.js version matches the Dockerfile version

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Project Link: [https://github.com/aselims/sanad](https://github.com/aselims/sanad)
- Website: [https://sanad.selimsalman.de](https://sanad.selimsalman.de)

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries

## Environment Variables

See `.env.example` for a list of all required environment variables.

## Architecture

The application follows a Vertical Slice Architecture:
- Frontend: React + TypeScript + Vite
- Backend: NestJS + Prisma ORM
- Database: PostgreSQL

## Best Practices
- Keep environment variables secure and never commit them to version control
- Regularly update your Docker images to get security patches
- Back up your database volumes regularly
- Monitor your application's performance and logs 