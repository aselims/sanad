import express from 'express';
import * as challengeController from '../controllers/challengeController';
import { authenticateJWT } from '../middlewares/auth';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Wrapper function to handle async controller methods
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes
router.get('/', asyncHandler(challengeController.getAllChallenges));
router.get('/:id', asyncHandler(challengeController.getChallengeById));

// Protected routes (require authentication)
router.post('/', authenticateJWT, asyncHandler(challengeController.createChallenge));
router.put('/:id', authenticateJWT, asyncHandler(challengeController.updateChallenge));
router.delete('/:id', authenticateJWT, asyncHandler(challengeController.deleteChallenge));

export default router; 