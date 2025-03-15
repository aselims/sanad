# T3awanu-2 Project

A full-stack application with separate frontend and backend directories.

## Project Structure

The project is organized into two main directories:

- **frontend**: Contains the React application built with Vite, TypeScript, and Tailwind CSS
- **backend**: Contains the Node.js API server built with Express and TypeScript

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd t3awanu-2
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm run install:all
   ```

### Running the Application

To run both the frontend and backend concurrently:

```
npm start
```

To run only the frontend:

```
npm run start:frontend
```

To run only the backend:

```
npm run start:backend
```

### Debugging in Development Mode

To run both frontend and backend in debug mode:

```
npm run debug
```

To debug only the frontend:

```
npm run debug:frontend
```

To debug only the backend:

```
npm run debug:backend
```

For the backend, this enables the Node.js inspector on the default port (9229), allowing you to connect with Chrome DevTools or VS Code debugger.

### Building for Production

To build both frontend and backend:

```
npm run build
```

## Frontend

The frontend is a React application built with:

- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React for icons

For more details, see the [frontend README](./frontend/README.md).

## Backend

The backend is a Node.js API server built with:

- Express
- TypeScript
- Passport for authentication
- TypeORM for database operations

For more details, see the [backend README](./backend/README.md). 