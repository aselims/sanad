# Environment Variables Documentation

This document describes all environment variables used by the Sanad application.

## Core Configuration

### Server Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `NODE_ENV` | string | `development` | ❌ | Application environment (`development`, `production`, `test`) |
| `PORT` | number | `3000` | ❌ | Port number for the server to listen on |

### Database Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `DATABASE_URL` | string | - | ⚠️ | Full PostgreSQL connection URL (takes precedence over individual DB vars) |
| `DB_HOST` | string | `localhost` | ❌ | PostgreSQL host |
| `DB_PORT` | number | `5432` | ❌ | PostgreSQL port |
| `DB_USERNAME` | string | `postgres` | ❌ | PostgreSQL username |
| `DB_PASSWORD` | string | `postgres` | ❌ | PostgreSQL password |
| `DB_DATABASE` | string | `sanad_db` | ❌ | PostgreSQL database name |
| `DB_SYNC` | boolean | `false` | ❌ | Enable TypeORM schema synchronization (⚠️ dev only) |

### Authentication & Security

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `JWT_SECRET` | string | - | ✅ | Secret key for JWT token signing (must be strong in production) |
| `JWT_EXPIRES_IN` | string | `1d` | ❌ | JWT token expiration time |

### External APIs

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `OPENAI_API_KEY` | string | - | ✅ | Groq API key for AI-powered search features |

### Application Settings

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `CORS_ORIGIN` | string | `http://localhost:8081` | ❌ | Allowed CORS origin for frontend |
| `LOG_LEVEL` | string | `info` | ❌ | Logging level (`debug`, `info`, `warn`, `error`) |

## Environment-Specific Defaults

### Development Environment

```bash
NODE_ENV=development
PORT=3000
DB_SYNC=true
JWT_EXPIRES_IN=7d
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:8081
```

### Production Environment

```bash
NODE_ENV=production
DB_SYNC=false
JWT_EXPIRES_IN=1d
LOG_LEVEL=info
# JWT_SECRET and OPENAI_API_KEY are REQUIRED
```

### Test Environment

```bash
NODE_ENV=test
PORT=3001
DB_DATABASE=sanad_test_db
DB_SYNC=true
JWT_EXPIRES_IN=1h
LOG_LEVEL=warn
```

## Setting Up Environment Variables

### 1. Development Setup

Create a `.env` file in the backend directory:

```bash
cp backend/.env.example backend/.env
```

Edit the `.env` file with your local configuration:

```bash
# Required for AI features
OPENAI_API_KEY=your_groq_api_key_here

# Database (if using custom setup)
DATABASE_URL=postgresql://postgres:password@localhost:5432/sanad_db

# Security (change for production)
JWT_SECRET=your-super-secret-jwt-key-for-development

# Optional customizations
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### 2. Production Setup

Set environment variables in your production environment:

```bash
# Required
export NODE_ENV=production
export JWT_SECRET=very-strong-production-secret-key
export OPENAI_API_KEY=your_production_groq_api_key
export DATABASE_URL=postgresql://user:pass@prod-host:5432/sanad_db

# Optional
export PORT=3000
export CORS_ORIGIN=https://yourdomain.com
export LOG_LEVEL=info
```

### 3. Docker Compose Setup

For Docker deployments, use environment files:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/sanad_db
```

## Validation Rules

The application validates environment variables on startup:

### Development
- `OPENAI_API_KEY` can be placeholder value
- `JWT_SECRET` can use development default
- `DB_SYNC` defaults to `true` for convenience

### Production
- `JWT_SECRET` must be set and not use default values
- `OPENAI_API_KEY` must be a valid Groq API key
- `DB_SYNC` must be `false` (automatic safety check)
- Database connection must be secure

### Test
- Uses separate test database by default
- Short-lived JWT tokens for security
- Minimal logging to avoid test output clutter

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret in production
2. **Database Passwords**: Use strong passwords and consider connection encryption
3. **API Keys**: Rotate API keys regularly and use environment-specific keys
4. **CORS Origins**: Restrict to your actual frontend domain in production
5. **Database Sync**: Never enable in production (data loss risk)

## Troubleshooting

### Common Issues

1. **"JWT_SECRET must be changed from default value in production"**
   - Set a custom `JWT_SECRET` environment variable

2. **"OPENAI_API_KEY environment variable is required in production"**
   - Obtain a Groq API key and set the `OPENAI_API_KEY` variable

3. **"Database synchronization must be disabled in production"**
   - Ensure `DB_SYNC` is not set to `true` in production

4. **Database connection errors**
   - Verify `DATABASE_URL` or individual DB connection variables
   - Check database server is running and accessible

### Configuration Testing

Test your configuration with:

```bash
# Backend validation
npm run dev  # Will fail fast if config is invalid

# Check current configuration (development only)
curl http://localhost:3000/api/health
```

## Migration from Legacy Configuration

If upgrading from a version that used direct `process.env` access:

1. Review this documentation for new variable names
2. Update your `.env` files to match the expected format
3. Test in development before deploying to production
4. Consider using environment-specific configuration files for complex setups