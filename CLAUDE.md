# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sanad is an innovation collaboration platform that connects innovators, researchers, startups, and investors. It features AI-powered matchmaking, role-based profiles, collaboration tools, real-time messaging, and challenge management.

## Development Commands

### Root Level Commands
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start both frontend and backend in development mode
npm start

# Build both frontend and backend for production
npm run build

# Run tests for both frontend and backend
npm test

# Debug mode for both services
npm run debug
```

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
- **Single .env file**: All environment variables are stored in `sanad/.env` (project root)
- **Backend configuration**: Uses sophisticated config system in `backend/src/config/`
  - Environment-specific defaults in `backend/src/config/environments/`
  - Type-safe validation and fallbacks
  - Explicit loading from root `.env` via `dotenv.config({ path: '../.env' })`
- **Docker integration**: `docker-compose.dev.yml` references root `.env` file
- **No duplicate files**: Previously had duplicate `.env` files, now centralized at root level

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
1. Use `./dev.sh` for local development setup
2. Frontend runs on development server with hot reload
3. Backend uses ts-node-dev for automatic TypeScript compilation and restart
4. Database migrations should be run when schema changes
5. ESLint is configured for both frontend and backend code quality

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