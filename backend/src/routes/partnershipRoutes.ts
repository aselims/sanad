import express from 'express';
import * as partnershipController from '../controllers/partnershipController';
import { authenticateJWT } from '../middlewares/auth';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Wrapper function to handle async controller methods
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes - Make sure specific routes come before parameterized routes
router.get('/', asyncHandler(partnershipController.getAllPartnerships));

// Any specific routes with fixed paths should go here
// For example: router.get('/featured', asyncHandler(partnershipController.getFeaturedPartnerships));

// Parameterized routes should come last
router.get('/:id', asyncHandler(partnershipController.getPartnershipById));

// Protected routes (require authentication)
router.post('/', authenticateJWT, asyncHandler(partnershipController.createPartnership));
router.put('/:id', authenticateJWT, asyncHandler(partnershipController.updatePartnership));
router.delete('/:id', authenticateJWT, asyncHandler(partnershipController.deletePartnership));

export default router;
