import { Router } from 'express';
import { ProjectUpdateController } from '../controllers/projectUpdateController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const projectUpdateController = new ProjectUpdateController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Project update routes
router.get('/', authenticateJWT, asyncHandler(projectUpdateController.getAllUpdates.bind(projectUpdateController)));
router.post('/', authenticateJWT, asyncHandler(projectUpdateController.createUpdate.bind(projectUpdateController)));
router.get('/project/:projectId', authenticateJWT, asyncHandler(projectUpdateController.getProjectUpdates.bind(projectUpdateController)));
router.get('/project/:projectId/health', authenticateJWT, asyncHandler(projectUpdateController.getProjectHealthMetrics.bind(projectUpdateController)));
router.get('/project/:projectId/analytics', authenticateJWT, asyncHandler(projectUpdateController.getUpdateAnalytics.bind(projectUpdateController)));
router.put('/:id', authenticateJWT, asyncHandler(projectUpdateController.updateProjectUpdate.bind(projectUpdateController)));
router.delete('/:id', authenticateJWT, asyncHandler(projectUpdateController.deleteUpdate.bind(projectUpdateController)));

export default router;