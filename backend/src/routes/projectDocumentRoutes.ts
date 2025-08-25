import { Router } from 'express';
import { ProjectDocumentController } from '../controllers/projectDocumentController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const projectDocumentController = new ProjectDocumentController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Project document routes
router.get('/', authenticateJWT, asyncHandler(projectDocumentController.getAllDocuments.bind(projectDocumentController)));
router.post('/', authenticateJWT, asyncHandler(projectDocumentController.createDocument.bind(projectDocumentController)));
router.get('/project/:projectId', authenticateJWT, asyncHandler(projectDocumentController.getProjectDocuments.bind(projectDocumentController)));
router.get('/project/:projectId/analytics', authenticateJWT, asyncHandler(projectDocumentController.getDocumentAnalytics.bind(projectDocumentController)));
router.get('/:id/versions', authenticateJWT, asyncHandler(projectDocumentController.getDocumentVersions.bind(projectDocumentController)));
router.put('/:id', authenticateJWT, asyncHandler(projectDocumentController.updateDocument.bind(projectDocumentController)));
router.post('/:id/track', authenticateJWT, asyncHandler(projectDocumentController.trackDocumentAccess.bind(projectDocumentController)));
router.delete('/:id', authenticateJWT, asyncHandler(projectDocumentController.deleteDocument.bind(projectDocumentController)));

export default router;