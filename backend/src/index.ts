import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { initializeDatabase } from './config/data-source';
import { initializePassport } from './config/passport';
import logger from './utils/logger';
import apiRoutes from './routes/api';
import { errorHandler, AppError } from './middlewares/errorHandler';
import matchRoutes from './routes/matchRoutes';
import ideaRoutes from './routes/ideaRoutes';
import partnershipRoutes from './routes/partnershipRoutes';
import challengeRoutes from './routes/challengeRoutes';
import collaborationRoutes from './routes/collaborationRoutes';
import fileRoutes from './routes/fileRoutes';
import authRoutes from './routes/auth.routes';
import path from 'path';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? [process.env.CORS_ORIGIN]
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());
initializePassport();

// Log HTTP requests
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/partnerships', partnershipRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(function (err: Error | AppError, req: Request, res: Response, next: NextFunction) {
  errorHandler(err, req, res, next);
});

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack || '');
  // Close server & exit process
  process.exit(1);
});

startServer();
