import { Router } from 'express';
import { ProjectRiskController } from '../controllers/projectRiskController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const projectRiskController = new ProjectRiskController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Project risk routes
router.get('/', authenticateJWT, asyncHandler(projectRiskController.getAllRisks.bind(projectRiskController)));
router.post('/', authenticateJWT, asyncHandler(projectRiskController.createRisk.bind(projectRiskController)));
router.get('/project/:projectId', authenticateJWT, asyncHandler(projectRiskController.getProjectRisks.bind(projectRiskController)));
router.get('/project/:projectId/analytics', authenticateJWT, asyncHandler(projectRiskController.getRiskAnalytics.bind(projectRiskController)));
router.put('/:id', authenticateJWT, asyncHandler(projectRiskController.updateRisk.bind(projectRiskController)));
router.delete('/:id', authenticateJWT, asyncHandler(projectRiskController.deleteRisk.bind(projectRiskController)));

export default router;