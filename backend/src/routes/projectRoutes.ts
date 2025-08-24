import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { MilestoneController } from '../controllers/milestoneController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const projectController = new ProjectController();
const milestoneController = new MilestoneController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Project routes
router.post('/', authenticateJWT, asyncHandler(projectController.createProject.bind(projectController)));
router.get('/', authenticateJWT, asyncHandler(projectController.getUserProjects.bind(projectController)));
router.get('/stats', authenticateJWT, asyncHandler(projectController.getProjectStats.bind(projectController)));
router.get('/:id', authenticateJWT, asyncHandler(projectController.getProject.bind(projectController)));
router.put('/:id', authenticateJWT, asyncHandler(projectController.updateProject.bind(projectController)));
router.post('/convert-idea/:ideaId', authenticateJWT, asyncHandler(projectController.convertIdeaToProject.bind(projectController)));

// Milestone routes for projects
router.get('/:projectId/milestones', authenticateJWT, asyncHandler(milestoneController.getProjectMilestones.bind(milestoneController)));
router.get('/:projectId/milestones/stats', authenticateJWT, asyncHandler(milestoneController.getMilestoneStats.bind(milestoneController)));
router.post('/:projectId/milestones', authenticateJWT, asyncHandler(milestoneController.createMilestone.bind(milestoneController)));

export default router;