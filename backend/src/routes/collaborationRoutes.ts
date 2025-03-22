import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Challenge } from '../entities/Challenge';
import { Partnership } from '../entities/Partnership';
import { Idea } from '../entities/Idea';
import { authenticate } from '../middlewares/authenticate';

// Add type interfaces for vote tracking
interface VotableEntity {
  upvotes?: number;
  downvotes?: number;
  userVotes?: Record<string, 'up' | 'down'>;
  [key: string]: any;
}

const router = express.Router();

// Wrapper function to handle async controller methods
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Search collaborations (challenges, partnerships, and ideas)
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  
  if (!query) {
    return res.status(400).json({
      status: 'error',
      message: 'Search query is required'
    });
  }
  
  // Get all challenges, partnerships, and ideas from the database
  const challenges = await AppDataSource.getRepository(Challenge).find();
  const partnerships = await AppDataSource.getRepository(Partnership).find();
  const ideas = await AppDataSource.getRepository(Idea).find({
    relations: ['createdBy']
  });
  
  // Filter challenges based on the search query
  const lowerQuery = query.toLowerCase();
  const filteredChallenges = challenges.filter(challenge => 
    challenge && challenge.title && challenge.title.toLowerCase().includes(lowerQuery) ||
    challenge && challenge.description && challenge.description.toLowerCase().includes(lowerQuery) ||
    challenge && challenge.organization && challenge.organization.toLowerCase().includes(lowerQuery)
  );
  
  // Filter partnerships based on the search query
  const filteredPartnerships = partnerships.filter(partnership => 
    partnership && partnership.title && partnership.title.toLowerCase().includes(lowerQuery) ||
    partnership && partnership.description && partnership.description.toLowerCase().includes(lowerQuery) ||
    partnership && partnership.participants && partnership.participants.some(participant => 
      participant && participant.toLowerCase().includes(lowerQuery)
    )
  );
  
  // Filter ideas based on the search query
  const filteredIdeas = ideas.filter(idea => 
    idea && idea.title && idea.title.toLowerCase().includes(lowerQuery) ||
    idea && idea.description && idea.description.toLowerCase().includes(lowerQuery) ||
    idea && idea.category && idea.category.toLowerCase().includes(lowerQuery) ||
    idea && idea.participants && idea.participants.some(participant => 
      participant && participant.toLowerCase().includes(lowerQuery)
    )
  );
  
  // Combine and format the results
  const results = [
    ...filteredChallenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title || '',
      description: challenge.description || '',
      participants: challenge.organization ? [challenge.organization] : [], // Convert organization to participants array for consistency
      type: 'challenge',
      status: challenge.status || '',
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt
    })),
    ...filteredPartnerships.map(partnership => ({
      id: partnership.id,
      title: partnership.title || '',
      description: partnership.description || '',
      participants: partnership.participants || [],
      type: 'partnership',
      status: partnership.status || '',
      createdAt: partnership.createdAt,
      updatedAt: partnership.updatedAt
    })),
    ...filteredIdeas.map(idea => ({
      id: idea.id,
      title: idea.title || '',
      description: idea.description || '',
      participants: idea.participants || [],
      type: 'idea',
      status: idea.status || '',
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      creatorName: idea.createdBy ? `${idea.createdBy.firstName} ${idea.createdBy.lastName}` : 'Unknown'
    }))
  ];
  
  res.status(200).json({
    status: 'success',
    data: results
  });
}));

// Handle voting for a collaboration
router.post('/:id/vote', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { voteType } = req.body;
  const userId = req.user?.id;

  if (!voteType || (voteType !== 'up' && voteType !== 'down')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid vote type. Must be "up" or "down".'
    });
  }

  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: 'User ID is required for voting'
    });
  }

  // Try to find the item in each repository
  const challengeRepo = AppDataSource.getRepository(Challenge);
  const partnershipRepo = AppDataSource.getRepository(Partnership);
  const ideaRepo = AppDataSource.getRepository(Idea);

  let result;
  let entityType = '';

  // Check each repository in turn
  const challenge = await challengeRepo.findOne({ where: { id } });
  if (challenge) {
    // Cast to VotableEntity to handle additional properties
    const votableChallenge = challenge as unknown as VotableEntity;
    result = processVote(votableChallenge, userId, voteType);
    await challengeRepo.save(challenge);
    entityType = 'challenge';
  } else {
    const partnership = await partnershipRepo.findOne({ where: { id } });
    if (partnership) {
      // Cast to VotableEntity to handle additional properties
      const votablePartnership = partnership as unknown as VotableEntity;
      result = processVote(votablePartnership, userId, voteType);
      await partnershipRepo.save(partnership);
      entityType = 'partnership';
    } else {
      const idea = await ideaRepo.findOne({ where: { id } });
      if (idea) {
        // Cast to VotableEntity to handle additional properties
        const votableIdea = idea as unknown as VotableEntity;
        result = processVote(votableIdea, userId, voteType);
        await ideaRepo.save(idea);
        entityType = 'idea';
      } else {
        return res.status(404).json({
          status: 'error',
          message: 'Collaboration not found'
        });
      }
    }
  }

  return res.status(200).json({
    status: 'success',
    upvotes: result.upvotes,
    downvotes: result.downvotes,
    type: entityType
  });
}));

/**
 * Helper function to process votes
 */
function processVote(item: VotableEntity, userId: string, voteType: 'up' | 'down'): { upvotes: number, downvotes: number } {
  // Initialize vote properties if they don't exist
  if (item.upvotes === undefined) item.upvotes = 0;
  if (item.downvotes === undefined) item.downvotes = 0;
  if (item.userVotes === undefined) item.userVotes = {};
  
  const currentVote = item.userVotes[userId];
  
  // Update votes based on user's action
  if (currentVote === voteType) {
    // User is canceling their previous vote
    if (voteType === 'up') {
      item.upvotes = Math.max(0, item.upvotes - 1);
    } else {
      item.downvotes = Math.max(0, item.downvotes - 1);
    }
    delete item.userVotes[userId]; // Remove the vote
  } else if (currentVote) {
    // User is changing their vote
    if (currentVote === 'up') {
      item.upvotes = Math.max(0, item.upvotes - 1);
      item.downvotes += 1;
    } else {
      item.downvotes = Math.max(0, item.downvotes - 1);
      item.upvotes += 1;
    }
    item.userVotes[userId] = voteType;
  } else {
    // User is voting for the first time
    if (voteType === 'up') {
      item.upvotes += 1;
    } else {
      item.downvotes += 1;
    }
    item.userVotes[userId] = voteType;
  }
  
  return {
    upvotes: item.upvotes,
    downvotes: item.downvotes
  };
}

export default router; 