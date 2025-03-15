import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import authRoutes from './auth.routes';
import { User } from '../entities/User';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

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
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find({
    select: ['id', 'firstName', 'lastName', 'email', 'role', 'organization', 'position', 'bio', 'profilePicture', 'isVerified', 'isActive', 'createdAt', 'updatedAt']
  });
  
  res.status(200).json({
    status: 'success',
    data: users
  });
}));

// Search users - IMPORTANT: Place specific routes BEFORE parameterized routes
router.get('/users/search', asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  
  if (!query) {
    return res.status(400).json({
      status: 'error',
      message: 'Search query is required'
    });
  }
  
  // Get all users from the database
  const users = await AppDataSource.getRepository(User).find();
  
  // Filter users based on the search query
  const lowerQuery = query.toLowerCase();
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(lowerQuery) ||
    user.lastName.toLowerCase().includes(lowerQuery) ||
    user.email.toLowerCase().includes(lowerQuery) ||
    user.organization?.toLowerCase().includes(lowerQuery) ||
    user.bio?.toLowerCase().includes(lowerQuery) ||
    user.role.toLowerCase().includes(lowerQuery)
  );
  
  res.status(200).json({
    status: 'success',
    data: filteredUsers
  });
}));

// Current user profile
router.get('/users/me', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: User not authenticated'
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: req.user.id },
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
}));

// Get user by ID - Place this AFTER specific routes
router.get('/users/:id', asyncHandler(async (req: Request, res: Response) => {
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
}));

// Update current user profile
router.put('/users/me', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: User not authenticated'
    });
  }

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: req.user.id }
  });
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  // Update user fields
  userRepository.merge(user, req.body);
  
  // Save updated user
  const updatedUser = await userRepository.save(user);
  
  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
}));

// Update user by ID (admin only)
router.put('/users/:id', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: User not authenticated'
    });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Unauthorized: Admin access required'
    });
  }
  
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: req.params.id }
  });
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  // Update user fields
  userRepository.merge(user, req.body);
  
  // Save updated user
  const updatedUser = await userRepository.save(user);
  
  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
}));

// Connection requests
router.post('/connections/request', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: User not authenticated'
    });
  }

  const { targetUserId } = req.body;
  
  if (!targetUserId) {
    return res.status(400).json({
      status: 'error',
      message: 'Target user ID is required'
    });
  }
  
  // In a real application, you would create a connection request in the database
  // For now, we'll just return a success response
  
  res.status(200).json({
    status: 'success',
    message: 'Connection request sent successfully',
    data: {
      fromUserId: req.user.id,
      toUserId: targetUserId,
      status: 'pending',
      createdAt: new Date()
    }
  });
}));

// Messages
router.post('/messages', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: User not authenticated'
    });
  }

  const { recipientId, content } = req.body;
  
  if (!recipientId || !content) {
    return res.status(400).json({
      status: 'error',
      message: 'Recipient ID and message content are required'
    });
  }
  
  // In a real application, you would create a message in the database
  // For now, we'll just return a success response
  
  res.status(200).json({
    status: 'success',
    message: 'Message sent successfully',
    data: {
      fromUserId: req.user.id,
      toUserId: recipientId,
      content,
      createdAt: new Date()
    }
  });
}));

// AI-powered search endpoint
router.get('/ai-search', asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  
  if (!query) {
    return res.status(400).json({
      status: 'error',
      message: 'Search query is required'
    });
  }
  
  // Import the AI search service
  const { aiSearch } = await import('../services/ai-search.service');
  
  // Perform AI-enhanced search
  const results = await aiSearch(query);
  
  // Return the results
  res.status(200).json({
    status: 'success',
    data: results,
    meta: {
      count: results.length,
      query
    }
  });
}));

// Mount routes
router.use('/auth', authRoutes);

export default router; 