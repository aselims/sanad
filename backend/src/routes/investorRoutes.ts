import { Router } from 'express';
import { InvestorController } from '../controllers/investorController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const investorController = new InvestorController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Investor profile routes
router.post('/', authenticateJWT, asyncHandler(investorController.createInvestor.bind(investorController)));
router.get('/', asyncHandler(investorController.getInvestors.bind(investorController))); // Public endpoint for discovery
router.get('/stats', authenticateJWT, asyncHandler(investorController.getInvestorStats.bind(investorController)));
router.get('/:id', asyncHandler(investorController.getInvestor.bind(investorController))); // Public endpoint
router.put('/:id', authenticateJWT, asyncHandler(investorController.updateInvestor.bind(investorController)));
router.post('/:id/verify', authenticateJWT, asyncHandler(investorController.verifyInvestor.bind(investorController)));

// Matching routes
router.get('/match/project/:projectId', authenticateJWT, asyncHandler(investorController.matchInvestorsToProject.bind(investorController)));

export default router;