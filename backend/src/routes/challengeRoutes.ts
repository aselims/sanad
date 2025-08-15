import express from 'express';
import * as challengeController from '../controllers/challengeController';
import { authenticateJWT } from '../middlewares/auth';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Wrapper function to handle async controller methods
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes - Make sure specific routes come before parameterized routes
router.get('/', asyncHandler(challengeController.getAllChallenges));

// Any specific routes with fixed paths should go here
// For example: router.get('/featured', asyncHandler(challengeController.getFeaturedChallenges));

// Parameterized routes should come last
router.get('/:id', asyncHandler(challengeController.getChallengeById));

// Protected routes (require authentication)
router.post('/', authenticateJWT, asyncHandler(challengeController.createChallenge));
router.put('/:id', authenticateJWT, asyncHandler(challengeController.updateChallenge));
router.delete('/:id', authenticateJWT, asyncHandler(challengeController.deleteChallenge));

export default router;
