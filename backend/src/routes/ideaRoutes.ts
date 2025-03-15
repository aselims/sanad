import express from 'express';
import * as ideaController from '../controllers/ideaController';
import { authenticateJWT } from '../middlewares/auth';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Wrapper function to handle async controller methods
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes
router.get('/', asyncHandler(ideaController.getAllIdeas));
router.get('/:id', asyncHandler(ideaController.getIdeaById));

// Protected routes (require authentication)
router.post('/', authenticateJWT, asyncHandler(ideaController.createIdea));
router.put('/:id', authenticateJWT, asyncHandler(ideaController.updateIdea));
router.delete('/:id', authenticateJWT, asyncHandler(ideaController.deleteIdea));

export default router; 