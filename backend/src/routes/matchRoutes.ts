import { Router } from 'express';
import { MatchController } from '../controllers/matchController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();
const matchController = new MatchController();

router.get('/potential', authenticateJWT, (req, res) => matchController.getPotentialMatches(req, res));
router.post('/preferences', authenticateJWT, (req, res) => matchController.saveMatchPreference(req, res));
router.get('/history', authenticateJWT, (req, res) => matchController.getMatchHistory(req, res));

export default router; 