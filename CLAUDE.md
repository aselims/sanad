# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sanad is an innovation collaboration platform that connects innovators, researchers, startups, and investors. It features AI-powered matchmaking, role-based profiles, collaboration tools, real-time messaging, and challenge management.

## Development Setup & Commands

### Quick Start (Recommended)

The project supports both Docker and native npm development. **Docker is the recommended approach** as it provides consistent environment setup.

#### Using Docker (Recommended)
```bash
# Check if containers are already running
docker ps

# If containers exist and running:
# - Frontend: http://localhost:8081
# - Backend API: http://localhost:3022
# - Database: localhost:5435

# Start with docker-compose
docker-compose -f docker-compose.dev.yml up -d
```

#### Using npm (Local Development)
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start both frontend and backend in development mode
# Note: Frontend proxy may need configuration for local backend
npm start

# Build both frontend and backend for production
npm run build

# Run tests for both frontend and backend
npm test

# Debug mode for both services
npm run debug
```

### Important: Development Environment Detection

The application automatically detects whether you're running:
1. **Docker environment**: Uses Docker service names for backend proxy
2. **Local npm environment**: Requires localhost proxy configuration

### Root Level Commands

### Frontend Commands (in /frontend directory)
```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Testing
npm test
npm run test:watch
npm run test:coverage
```

### Backend Commands (in /backend directory)
```bash
# Development server with auto-reload
npm run dev

# Debug mode with inspector
npm run dev:debug

# Production build
npm run build

# Linting
npm run lint

# Database migrations
npm run migration:generate
npm run migration:run

# Seed database with users
npm run seed:users
```

### Docker Development

The project includes automated development scripts:

```bash
# Start development environment (recommended)
./dev.sh

# Start with local backend
./dev.sh --local

# Start with remote backend
./dev.sh --remote

# Seed database during startup
./dev.sh --local --seed-db

# Production deployment
./prod.sh
```

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: Context API (AuthContext, NotificationContext, CollaborationContext, ProfileContext)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Testing**: Jest with React Testing Library

### Backend (Node.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js (local and JWT strategies)
- **File Handling**: Multer for uploads
- **Logging**: Winston
- **Environment**: dotenv for configuration
- **AI Integration**: Groq API (llama-3.1-8b-instant) for AI-powered features

### Key Entities
- **User**: Core user model with role-based profiles (startup, research, corporate, government, investor, etc.)
- **Collaboration**: Main entity for partnerships, challenges, and ideas
- **Message**: Real-time messaging system
- **Match**: AI-powered matching system
- **Challenge**: Innovation challenges with deadlines and rewards
- **Partnership**: Business partnership opportunities
- **Notification**: System notifications

### Database Configuration
- Uses TypeORM with PostgreSQL
- Migrations located in `backend/src/migrations/`
- Entities in `backend/src/entities/`
- Database sync is controlled by `DB_SYNC=true` environment variable in development

### Environment Variable Management

**The project uses a centralized configuration system with environment-specific defaults:**

#### Configuration Files
- **Environment file**: `.env` or `.env.local` in project root
- **Config system**: `backend/src/config/config.ts` - centralized configuration
- **Environment defaults**: 
  - `backend/src/config/environments/development.ts`
  - `backend/src/config/environments/production.ts`
  - `backend/src/config/environments/test.ts`

#### How It Works
1. **Loads environment file**: `dotenv.config({ path: '../.env' })` from project root
2. **Applies environment defaults**: Based on `NODE_ENV` setting
3. **Environment variables override**: Any env var overrides the defaults
4. **Validates configuration**: Type-safe validation with helpful error messages
5. **Production safety**: Enforces security requirements in production

#### Key Environment Variables
```bash
# Required for production
JWT_SECRET=your-secure-jwt-secret
OPENAI_API_KEY=gsk_your_groq_api_key

# Database (uses individual vars or DATABASE_URL)
DATABASE_URL=postgresql://user:pass@host:port/database
# OR
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=sanad_db

# Application settings
NODE_ENV=development|production|test
PORT=3000
CORS_ORIGIN=http://localhost:8081
LOG_LEVEL=debug|info|warn|error
```

#### Environment-Specific Behavior
- **Development**: DB sync enabled, debug logging, longer JWT expiry, allows placeholder API keys
- **Production**: DB sync disabled, info logging, shorter JWT expiry, requires real API keys
- **Test**: Separate database, minimal logging, short JWT expiry

#### Docker Integration
- `docker-compose.dev.yml` loads `.env` file via `env_file` directive
- Environment variables in docker-compose override .env file values
- Backend config system handles both Docker and local development seamlessly

### Authentication Flow
- JWT-based authentication with refresh tokens
- Passport.js strategies for local and JWT authentication
- Protected routes using ProtectedRoute component
- User roles and permissions managed through UserRole enum

### File Structure Patterns
- **Services**: API communication layers in both frontend (`src/services/`) and backend (`src/services/`)
- **Controllers**: Backend route handlers in `backend/src/controllers/`
- **Middlewares**: Authentication and error handling in `backend/src/middlewares/`
- **Components**: React components organized by feature in `frontend/src/components/`
- **Types**: TypeScript definitions in `frontend/src/types.ts` and `backend/src/types/`

### Development Workflow

#### Recommended Docker Workflow
1. **Check running containers**: `docker ps` to see if sanad containers are already running
2. **Access running application**: 
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:3022
   - Database: localhost:5435
3. **Start containers if needed**: `docker-compose -f docker-compose.dev.yml up -d`
4. **View logs**: `docker-compose -f docker-compose.dev.yml logs -f`
5. **Stop containers**: `docker-compose -f docker-compose.dev.yml down`

#### Local npm Workflow
1. **Install dependencies**: `npm run install:all`
2. **Set up environment**: Ensure `.env` or `.env.local` exists in project root
3. **Configure frontend proxy**: Update `frontend/vite.config.ts` if needed:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3000', // For local backend
       // target: 'http://backend:3000',  // For Docker backend
       changeOrigin: true,
       secure: false,
     }
   }
   ```
4. **Start development**: `npm start`
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

#### General Development
1. Frontend runs with Vite hot reload
2. Backend uses ts-node-dev for automatic TypeScript compilation and restart
3. Database migrations should be run when schema changes
4. ESLint and Prettier are configured for code quality
5. Husky pre-commit hooks ensure code quality before commits

### Testing Approach
- Frontend: Jest + React Testing Library with setup in `jest.setup.js`
- Backend: Basic test structure in place (currently minimal)
- Coverage reports available via `npm run test:coverage`

### Deployment
- Docker-based deployment with separate containers for frontend, backend, and database
- Production deployment via `./prod.sh` script
- Production builds use `docker-compose.prod.yml` configuration
- Application is hosted at collopi.com
- Nginx reverse proxy configuration for production
- Environment variables managed through `.env` files

## Environment Setup Troubleshooting

### Development Environment Conflicts

**Problem**: Frontend proxy errors like "getaddrinfo ENOTFOUND backend"

**Root Cause**: Frontend is configured for Docker environment but running with npm locally.

**Solution**: Update `frontend/vite.config.ts` proxy target:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000', // For npm start
    // target: 'http://backend:3000', // For Docker
    changeOrigin: true,
    secure: false,
  }
}
```

### Docker vs npm Development

**When to use Docker**:
- ✅ Consistent environment across team members
- ✅ No need to install Node.js/PostgreSQL locally
- ✅ Production-like environment
- ✅ Easy database management

**When to use npm**:
- ✅ Faster development cycles (no container rebuilds)
- ✅ Direct debugging with IDE
- ✅ More familiar to Node.js developers

### Configuration Validation Errors

**Problem**: "JWT_SECRET must be changed from default value in production"

**Solution**: Set a custom JWT_SECRET in your environment file:
```bash
JWT_SECRET=your-super-secret-production-key-here
```

**Problem**: "OPENAI_API_KEY environment variable is required in production"

**Solution**: Add your Groq API key:
```bash
OPENAI_API_KEY=gsk_your_groq_api_key_here
```

## Troubleshooting

### Database Schema Issues

**Problem**: TypeORM entity column names don't match database column names, causing "column does not exist" errors.

**Root Cause**: Database migrations create snake_case columns (e.g., `created_by_id`) but TypeORM entities expect camelCase (e.g., `createdById`) without proper column name mapping.

**Solutions**:
1. **Quick Fix**: Use selective column queries in services to avoid problematic columns:
   ```typescript
   // Instead of .find() which loads all columns
   const entities = await repository.find();
   
   // Use selective queries
   const entities = await repository
     .createQueryBuilder('entity')
     .select(['entity.id', 'entity.title', 'entity.description'])
     .getMany();
   ```

2. **Proper Fix**: Add explicit column name mapping in entities:
   ```typescript
   @Column({ nullable: true, name: 'created_by_id' })
   createdById: string;
   
   @JoinColumn({ name: 'created_by_id' })
   createdBy: User;
   ```

3. **Production Migration Fix**: Run migrations in production environment:
   ```bash
   # Inside Docker container
   docker exec sanad-backend npx typeorm migration:run -d dist/config/data-source.js
   
   # Check database schema
   docker exec sanad-db psql -U sanad_user -d sanad -c "\d table_name"
   ```

**Prevention**: Always verify entity column mappings match the actual database schema after running migrations.

### Groq API Migration

**Migration Process**:
1. Update OpenAI client configuration to use Groq baseURL:
   ```typescript
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY, // Use Groq API key
     baseURL: "https://api.groq.com/openai/v1"
   });
   ```

2. Change model from `gpt-4o-mini` to `llama-3.1-8b-instant`

3. Test with sample queries to verify JSON response format compatibility

4. Rebuild Docker containers to apply changes:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

**API Key**: Use Groq API key (starting with `gsk_`) in OPENAI_API_KEY environment variable.
- we run all in docker
- clear context after each feature implementation and then get back to implementation with @progress.md @general-AI-guidelines.md