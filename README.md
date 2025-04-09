# T3awanu Project

## Project Overview
T3awanu is a collaborative platform that connects innovators, experts, and partners.

## Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Development Environment
This project uses Docker to manage all services (frontend, backend, and database). 

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Start the development environment:
```bash
docker-compose up
```

This will:
- Start the PostgreSQL database on port 5432
- Start the backend API server on port 3000
- Start the frontend development server on port 5173

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

### Running Services Individually

#### Database Only
```bash
docker-compose up postgres
```

#### Backend Only
```bash
cd backend
npm install
npm run dev
```

#### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
The backend uses environment variables defined in `backend/.env`. You can copy `backend/.env.example` to create this file.

Key variables:
- `DB_HOST`: Database hostname (use "localhost" for local development, "postgres" for Docker)
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name
- `JWT_SECRET`: Secret key for JWT tokens

### Frontend
The frontend uses Vite environment variables defined in `.env` files.

## Project Structure
- `/frontend`: React frontend application
- `/backend`: Node.js Express backend API
- `/docs`: Project documentation

## Development

### Database Migrations
```bash
cd backend
npm run migration:run
```

### Seeding Database
```bash
cd backend
npm run seed:users
```

## Troubleshooting
- If you encounter database connection issues, ensure the PostgreSQL service is running
- For Docker-related issues, try rebuilding the containers with `docker-compose up --build` 