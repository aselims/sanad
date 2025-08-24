import express, { Request, Response, NextFunction } from 'express';
import * as teamInvitationController from '../controllers/teamInvitationController';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();

// Wrapper function to handle async controller methods
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes require authentication
router.use(authenticateJWT);

// Team invitation management
router.post('/', asyncHandler(teamInvitationController.createInvitation));
router.get('/', asyncHandler(teamInvitationController.getUserInvitations));
router.put('/:id/respond', asyncHandler(teamInvitationController.respondToInvitation));
router.put('/:id/cancel', asyncHandler(teamInvitationController.cancelInvitation));

// Co-founder search
router.get('/search/co-founders', asyncHandler(teamInvitationController.findPotentialCoFounders));

export default router;