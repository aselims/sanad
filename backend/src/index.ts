import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import { initializeDatabase } from './config/data-source';
import { initializePassport } from './config/passport';
import { config } from './config/config';
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
import investorRoutes from './routes/investorRoutes';
import investmentRoutes from './routes/investmentRoutes';
import projectResourceRoutes from './routes/projectResourceRoutes';
import projectRiskRoutes from './routes/projectRiskRoutes';
import projectDocumentRoutes from './routes/projectDocumentRoutes';
import projectUpdateRoutes from './routes/projectUpdateRoutes';
import milestoneDependencyRoutes from './routes/milestoneDependencyRoutes';
import _path from 'path';

// Create Express app
const app = express();

// Middleware
const corsOptions = {
  origin: config.app.corsOrigin
    ? [config.app.corsOrigin]
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
app.use('/api/investors', investorRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/project-resources', projectResourceRoutes);
app.use('/api/project-risks', projectRiskRoutes);
app.use('/api/project-documents', projectDocumentRoutes);
app.use('/api/project-updates', projectUpdateRoutes);
app.use('/api/milestone-dependencies', milestoneDependencyRoutes);

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
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
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
