import express, { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import authRoutes from './auth.routes';
import { User } from '../entities/User';
import { Challenge } from '../entities/Challenge';
import { Partnership } from '../entities/Partnership';
import { authenticateJWT } from '../middlewares/auth';

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

// Users endpoints
router.get('/users', async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'organization', 'position', 'bio', 'profilePicture', 'isVerified', 'isActive', 'createdAt', 'updatedAt']
    });
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.params.id },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'organization', 'position', 'bio', 'profilePicture', 'isVerified', 'isActive', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
});

// Challenges endpoints
router.get('/challenges', async (req: Request, res: Response) => {
  try {
    const challengeRepository = AppDataSource.getRepository(Challenge);
    const challenges = await challengeRepository.find();
    
    res.status(200).json({
      status: 'success',
      data: challenges
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch challenges'
    });
  }
});

router.get('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const challengeRepository = AppDataSource.getRepository(Challenge);
    const challenge = await challengeRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!challenge) {
      return res.status(404).json({
        status: 'error',
        message: 'Challenge not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch challenge'
    });
  }
});

// Partnerships endpoints
router.get('/partnerships', async (req: Request, res: Response) => {
  try {
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    const partnerships = await partnershipRepository.find();
    
    res.status(200).json({
      status: 'success',
      data: partnerships
    });
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch partnerships'
    });
  }
});

router.get('/partnerships/:id', async (req: Request, res: Response) => {
  try {
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    const partnership = await partnershipRepository.findOne({
      where: { id: req.params.id }
    });
    
    if (!partnership) {
      return res.status(404).json({
        status: 'error',
        message: 'Partnership not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: partnership
    });
  } catch (error) {
    console.error('Error fetching partnership:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch partnership'
    });
  }
});

// Mount routes
router.use('/auth', authRoutes);

export default router; 