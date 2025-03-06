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
7. Start the development server:
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
├── services/       # Business logic
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## Available Scripts

- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run migration:generate` - Generate TypeORM migrations
- `npm run migration:run` - Run TypeORM migrations

## License

This project is licensed under the MIT License. 