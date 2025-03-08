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

// Current user profile
router.get('/users/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch current user'
    });
  }
});

// Update current user profile
router.put('/users/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user profile'
    });
  }
});

// Update user by ID (admin only)
router.put('/users/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
});

// Connection requests
router.post('/connections/request', authenticateJWT, async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send connection request'
    });
  }
});

// Messages
router.post('/messages', authenticateJWT, async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message'
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

// Search users
router.get('/users/search', async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search users'
    });
  }
});

// Search collaborations (challenges and partnerships)
router.get('/collaborations/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    // Get all challenges and partnerships from the database
    const challenges = await AppDataSource.getRepository(Challenge).find();
    const partnerships = await AppDataSource.getRepository(Partnership).find();
    
    // Filter challenges based on the search query
    const lowerQuery = query.toLowerCase();
    const filteredChallenges = challenges.filter(challenge => 
      challenge.title.toLowerCase().includes(lowerQuery) ||
      challenge.description.toLowerCase().includes(lowerQuery) ||
      challenge.organization.toLowerCase().includes(lowerQuery)
    );
    
    // Filter partnerships based on the search query
    // Note: Partnership entity doesn't have an organization field, so we only search in title, description, and participants
    const filteredPartnerships = partnerships.filter(partnership => 
      partnership.title.toLowerCase().includes(lowerQuery) ||
      partnership.description.toLowerCase().includes(lowerQuery) ||
      partnership.participants.some(participant => participant.toLowerCase().includes(lowerQuery))
    );
    
    // Combine and format the results
    const results = [
      ...filteredChallenges.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        participants: [challenge.organization], // Convert organization to participants array for consistency
        type: 'challenge',
        status: challenge.status,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt
      })),
      ...filteredPartnerships.map(partnership => ({
        id: partnership.id,
        title: partnership.title,
        description: partnership.description,
        participants: partnership.participants,
        type: 'partnership',
        status: partnership.status,
        createdAt: partnership.createdAt,
        updatedAt: partnership.updatedAt
      }))
    ];
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('Error searching collaborations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search collaborations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI-powered search endpoint
router.get('/ai-search', async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error('Error in AI search:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to perform AI search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mount routes
router.use('/auth', authRoutes);

export default router; 