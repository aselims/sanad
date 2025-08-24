import { Router } from 'express';
import { MentorController } from '../controllers/mentorController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const mentorController = new MentorController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Mentor profile routes
router.post('/profile', authenticateJWT, asyncHandler(mentorController.createMentorProfile.bind(mentorController)));
router.put('/profile/:id', authenticateJWT, asyncHandler(mentorController.updateMentorProfile.bind(mentorController)));
router.get('/profile/:id', asyncHandler(mentorController.getMentorProfile.bind(mentorController)));
router.get('/profile/:id/stats', asyncHandler(mentorController.getMentorStats.bind(mentorController)));

// Mentor search and discovery
router.get('/search', asyncHandler(mentorController.searchMentors.bind(mentorController)));

// Mentoring session routes
router.post('/:mentorId/request-session', authenticateJWT, asyncHandler(mentorController.requestSession.bind(mentorController)));
router.post('/sessions/:sessionId/respond', authenticateJWT, asyncHandler(mentorController.respondToSessionRequest.bind(mentorController)));
router.put('/sessions/:sessionId', authenticateJWT, asyncHandler(mentorController.updateSession.bind(mentorController)));
router.post('/sessions/:sessionId/rate', authenticateJWT, asyncHandler(mentorController.rateSession.bind(mentorController)));

// User's mentoring sessions
router.get('/sessions/my-sessions', authenticateJWT, asyncHandler(mentorController.getUserSessions.bind(mentorController)));

export default router;