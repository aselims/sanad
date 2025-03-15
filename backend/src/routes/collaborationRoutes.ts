import express, { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Challenge } from '../entities/Challenge';
import { Partnership } from '../entities/Partnership';
import { Idea } from '../entities/Idea';

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

export default router; 