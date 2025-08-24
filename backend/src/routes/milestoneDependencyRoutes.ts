import { Router } from 'express';
import { MilestoneDependencyController } from '../controllers/milestoneDependencyController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const milestoneDependencyController = new MilestoneDependencyController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Milestone dependency routes
router.post('/', authenticateJWT, asyncHandler(milestoneDependencyController.createDependency.bind(milestoneDependencyController)));
router.get('/milestone/:milestoneId', authenticateJWT, asyncHandler(milestoneDependencyController.getMilestoneDependencies.bind(milestoneDependencyController)));
router.get('/project/:projectId', authenticateJWT, asyncHandler(milestoneDependencyController.getProjectDependencies.bind(milestoneDependencyController)));
router.put('/:id', authenticateJWT, asyncHandler(milestoneDependencyController.updateDependency.bind(milestoneDependencyController)));
router.delete('/:id', authenticateJWT, asyncHandler(milestoneDependencyController.deleteDependency.bind(milestoneDependencyController)));

export default router;