import { Router } from 'express';
import { ProjectResourceController } from '../controllers/projectResourceController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const projectResourceController = new ProjectResourceController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Project resource routes
router.get('/', authenticateJWT, asyncHandler(projectResourceController.getAllResources.bind(projectResourceController)));
router.post('/', authenticateJWT, asyncHandler(projectResourceController.createResource.bind(projectResourceController)));
router.get('/project/:projectId', authenticateJWT, asyncHandler(projectResourceController.getProjectResources.bind(projectResourceController)));
router.get('/project/:projectId/analytics', authenticateJWT, asyncHandler(projectResourceController.getResourceAnalytics.bind(projectResourceController)));
router.put('/:id', authenticateJWT, asyncHandler(projectResourceController.updateResource.bind(projectResourceController)));
router.delete('/:id', authenticateJWT, asyncHandler(projectResourceController.deleteResource.bind(projectResourceController)));

export default router;