# SANAD Backend

This is the backend API for the SANAD Innovation Collaboration Platform.

## Tech Stack

- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **TypeORM** - ORM for TypeScript/Node.js
- **Winston** - Logging library

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the `.env.example` file
5. Set up the PostgreSQL database:
   ```
   createdb sanad_db
   ```
6. Run database migrations:
   ```
   npm run migration:run
   ```
7. Seed the database with initial users:
   ```
   npm run seed:users
   ```
8. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request controllers
├── entities/       # TypeORM entities
├── middlewares/    # Express middlewares
├── migrations/     # TypeORM migrations
├── routes/         # API routes
├── scripts/        # Utility scripts (e.g., database seeding)
├── services/       # Business logic
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## Available Scripts

- `npm run dev` - Start the development server with hot-reload
- `npm start` - Start the production server
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint
- `npm run migration:generate` - Generate TypeORM migrations
- `npm run migration:run` - Run TypeORM migrations
- `npm run seed:users` - Seed the database with initial users for testing

## Testing Potential Matches Functionality

The platform includes an AI-powered matching system that connects innovators based on their profiles. To test this functionality:

1. Seed the database with test users:
   ```
   npm run seed:users
   ```

2. Log in with one of the following test accounts:
   - **Startup**: ahmed@techstartup.sa (Password: Password123!)
   - **Individual**: youssef@gmail.com (Password: Password123!)
   - **Research**: mohammed@kaust.edu.sa (Password: Password123!)
   - **Investor**: saad@svc.sa (Password: Password123!)

3. Navigate to your profile page and click on the "Potential Matches" tab to see AI-suggested matches based on:
   - Shared tags (50% weight)
   - Type compatibility (30% weight)
   - Location proximity (20% weight)

The seed users have been configured with complementary profiles to demonstrate the matching algorithm effectively.

## Performance Optimization

### Preventing High CPU Usage

To prevent high CPU usage in the Node.js process, follow these best practices:

1. **Database Synchronization**: 
   - Set `DB_SYNC=false` in your `.env` file during normal development
   - Only enable synchronization (`DB_SYNC=true`) when you need to update the database schema
   - Always use migrations in production instead of synchronization

2. **Logging Level**:
   - Adjust the logging level based on your needs:
   ```
   LOG_LEVEL=error    # Only log errors
   LOG_LEVEL=warn     # Log warnings and errors
   LOG_LEVEL=info     # Log info, warnings, and errors (default)
   LOG_LEVEL=debug    # Log everything (use only for debugging)
   ```
   - Start the server with reduced logging:
   ```
   NODE_ENV=development LOG_LEVEL=warn npm run dev
   ```

3. **TypeORM Configuration**:
   - Use connection pooling with appropriate pool size
   - Enable query caching for frequently used queries
   - Set timeout for long-running queries
   - Limit logging to only errors and warnings

4. **Authentication**:
   - Add timeouts to prevent hanging authentication processes
   - Skip authentication for health check and public endpoints
   - Use proper error handling in authentication middleware

5. **Monitoring**:
   - If you notice high CPU usage, identify the process:
   ```
   ps aux | grep node
   ```
   - Kill the problematic process if necessary:
   ```
   kill -9 <process_id>
   ```

## License

This project is licensed under the MIT License. 