import { Router } from 'express';
import { MilestoneController } from '../controllers/milestoneController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const milestoneController = new MilestoneController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Individual milestone routes (not project-specific)
router.get('/my-milestones', authenticateJWT, asyncHandler(milestoneController.getUserMilestones.bind(milestoneController)));
router.put('/:id', authenticateJWT, asyncHandler(milestoneController.updateMilestone.bind(milestoneController)));
router.delete('/:id', authenticateJWT, asyncHandler(milestoneController.deleteMilestone.bind(milestoneController)));

export default router;