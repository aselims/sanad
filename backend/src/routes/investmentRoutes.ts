import { Router } from 'express';
import { InvestmentController } from '../controllers/investmentController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const investmentController = new InvestmentController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Investment tracking routes
router.post('/interest/:projectId', authenticateJWT, asyncHandler(investmentController.expressInterest.bind(investmentController)));
router.get('/', authenticateJWT, asyncHandler(investmentController.getInvestments.bind(investmentController)));
router.get('/pipeline/stats', authenticateJWT, asyncHandler(investmentController.getInvestmentPipelineStats.bind(investmentController)));
router.get('/:id', authenticateJWT, asyncHandler(investmentController.getInvestment.bind(investmentController)));
router.put('/:id', authenticateJWT, asyncHandler(investmentController.updateInvestment.bind(investmentController)));
router.post('/:id/meetings', authenticateJWT, asyncHandler(investmentController.addMeetingRecord.bind(investmentController)));

export default router;