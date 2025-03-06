import express, { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import authRoutes from './auth.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  const dbStatus = AppDataSource.isInitialized ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    database: dbStatus,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API version endpoint
router.get('/version', (req: Request, res: Response) => {
  res.status(200).json({
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Mount routes
router.use('/auth', authRoutes);

export default router; 