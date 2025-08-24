import { Router } from 'express';
import { TeamController } from '../controllers/teamController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const teamController = new TeamController();

// Helper function to handle async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Team routes
router.post('/', authenticateJWT, asyncHandler(teamController.createTeam.bind(teamController)));
router.get('/', authenticateJWT, asyncHandler(teamController.getUserTeams.bind(teamController)));
router.get('/:id', authenticateJWT, asyncHandler(teamController.getTeam.bind(teamController)));
router.get('/:id/stats', authenticateJWT, asyncHandler(teamController.getTeamStats.bind(teamController)));

// Team member management
router.post('/:teamId/invite', authenticateJWT, asyncHandler(teamController.inviteToTeam.bind(teamController)));
router.post('/:teamId/respond', authenticateJWT, asyncHandler(teamController.respondToInvitation.bind(teamController)));
router.put('/:teamId/members/:memberId', authenticateJWT, asyncHandler(teamController.updateTeamMember.bind(teamController)));
router.delete('/:teamId/members/:memberId', authenticateJWT, asyncHandler(teamController.removeTeamMember.bind(teamController)));

// Team member search
router.get('/:teamId/search-members', authenticateJWT, asyncHandler(teamController.searchPotentialMembers.bind(teamController)));

export default router;