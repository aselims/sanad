import express, { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import authRoutes from './auth.routes';
import { User } from '../entities/User';
import { authenticateJWT } from '../middlewares/auth';
import { aiSearchRateLimit, smartAISearchRateLimit } from '../middlewares/rateLimit';
import { optionalAuthentication } from '../middlewares/auth';
import {
  sendConnectionRequest,
  getConnectionRequests,
  getUserConnections,
  respondToConnectionRequest,
} from '../controllers/connectionController';
import { sendMessage, getConversation, getConversations } from '../controllers/messageController';
import { Partnership } from '../entities/Partnership';
import { Challenge } from '../entities/Challenge';
import { Idea } from '../entities/Idea';
import notificationRoutes from './notificationRoutes';
import interestRoutes from './interestRoutes';

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
router.get(
  '/users',
  asyncHandler(async (req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'role',
        'organization',
        'position',
        'bio',
        'profilePicture',
        'isVerified',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    res.status(200).json({
      status: 'success',
      data: users,
    });
  })
);

// Search users - IMPORTANT: Place specific routes BEFORE parameterized routes
router.get(
  '/users/search',
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required',
      });
    }

    // Get all users from the database
    const users = await AppDataSource.getRepository(User).find();

    // Filter users based on the search query
    const lowerQuery = query.toLowerCase();
    const filteredUsers = users.filter(
      user =>
        user.firstName.toLowerCase().includes(lowerQuery) ||
        user.lastName.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.organization?.toLowerCase().includes(lowerQuery) ||
        user.bio?.toLowerCase().includes(lowerQuery) ||
        user.role.toLowerCase().includes(lowerQuery)
    );

    res.status(200).json({
      status: 'success',
      data: filteredUsers,
    });
  })
);

// Current user profile
router.get(
  '/users/me',
  authenticateJWT,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.user.id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'role',
        'organization',
        'position',
        'bio',
        'profilePicture',
        'isVerified',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  })
);

// Get user by ID - Place this AFTER specific routes
router.get(
  '/users/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.params.id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'role',
        'organization',
        'position',
        'bio',
        'profilePicture',
        'isVerified',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  })
);

// Get collaborations for a specific user
router.get(
  '/users/:id/collaborations',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
      // Get partnerships created by the user (using backward compatible approach)
      const partnerships = await AppDataSource.getRepository(Partnership)
        .createQueryBuilder('partnership')
        .where('partnership.initiatorId = :userId', { userId })
        .getMany();

      // Get challenges created by the user
      const challenges = await AppDataSource.getRepository(Challenge).find({
        where: { createdById: userId },
      });

      // Get ideas created by the user
      const ideas = await AppDataSource.getRepository(Idea).find({
        where: { createdById: userId },
      });

      // Format partnerships to match Collaboration type
      const formattedPartnerships = partnerships.map((partnership: any) => ({
        id: partnership.id,
        title: partnership.title,
        description: partnership.description,
        participants: partnership.participants || [],
        status: partnership.status,
        type: 'partnership' as const,
        partnershipDetails: {
          duration: partnership.duration,
          resources: partnership.resources,
          expectedOutcomes: partnership.expectedOutcomes,
        },
        createdById: partnership.createdById, // Use the getter which maps to initiatorId
        createdAt: partnership.createdAt,
        updatedAt: partnership.updatedAt,
      }));

      // Format challenges to match Collaboration type
      const formattedChallenges = challenges.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        participants: [challenge.organization],
        status:
          challenge.status === 'open'
            ? 'proposed'
            : challenge.status === 'in-progress'
              ? 'active'
              : 'completed',
        type: 'challenge' as const,
        challengeDetails: {
          deadline: challenge.deadline,
          reward: challenge.reward,
          eligibilityCriteria: challenge.eligibilityCriteria,
        },
        createdById: challenge.createdById,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt,
      }));

      // Format ideas to match Collaboration type
      const formattedIdeas = ideas.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        participants: idea.participants || [],
        status: idea.status,
        type: 'idea' as const,
        ideaDetails: {
          category: idea.category,
          stage: idea.stage,
          targetAudience: idea.targetAudience,
          potentialImpact: idea.potentialImpact,
          resourcesNeeded: idea.resourcesNeeded,
        },
        createdById: idea.createdById,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      }));

      // Combine all collaborations
      const collaborations = [...formattedPartnerships, ...formattedChallenges, ...formattedIdeas];

      res.status(200).json({
        status: 'success',
        data: collaborations,
      });
    } catch (error: any) {
      console.error('Error fetching user collaborations:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user collaborations',
        error: error.message,
      });
    }
  })
);

// Update current user profile
router.put(
  '/users/me',
  authenticateJWT,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Update user fields
    userRepository.merge(user, req.body);

    // Save updated user
    const updatedUser = await userRepository.save(user);

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  })
);

// Update user by ID (admin only)
router.put(
  '/users/:id',
  authenticateJWT,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Admin access required',
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Update user fields
    userRepository.merge(user, req.body);

    // Save updated user
    const updatedUser = await userRepository.save(user);

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  })
);

// Connection endpoints
router.post('/connections/request', authenticateJWT, asyncHandler(sendConnectionRequest));
router.get('/connections/requests', authenticateJWT, asyncHandler(getConnectionRequests));
router.get('/connections', authenticateJWT, asyncHandler(getUserConnections));
router.post('/connections/respond', authenticateJWT, asyncHandler(respondToConnectionRequest));

// Message endpoints
router.post('/messages', authenticateJWT, asyncHandler(sendMessage));
router.get('/messages/conversations', authenticateJWT, asyncHandler(getConversations));
router.get('/messages/conversations/:userId', authenticateJWT, asyncHandler(getConversation));

// AI-powered search endpoint with smart rate limiting and optional authentication
router.get(
  '/ai-search',
  optionalAuthentication,
  smartAISearchRateLimit,
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required',
      });
    }

    // Import the AI search service
    const { aiSearch } = await import('../services/ai-search.service');

    // Perform AI-enhanced search
    const results = await aiSearch(query);

    // Check authentication status for response metadata
    const user = (req as any).user;
    const isAuthenticated = user && user.id;

    // Return the results with enhanced metadata
    res.status(200).json({
      status: 'success',
      data: results,
      meta: {
        count: results.length,
        query,
        authenticated: isAuthenticated,
        rateLimitType: isAuthenticated ? 'user' : 'ip',
        searchEnhancements: {
          fuzzyMatching: true,
          intentDetection: true,
          synonymExpansion: true,
          entityCoverage: ['users', 'challenges', 'partnerships', 'ideas'],
        },
      },
    });
  })
);

// Mount routes
router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/interest', interestRoutes);

export default router;
