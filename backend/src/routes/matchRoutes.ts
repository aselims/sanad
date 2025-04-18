import { Router } from 'express';
import { MatchController } from '../controllers/matchController';
import { authenticateJWT } from '../middlewares/auth';
import { routeHandler } from '../utils/express-types';

const router = Router();
const matchController = new MatchController();

router.get('/potential', authenticateJWT, routeHandler((req, res) => matchController.getPotentialMatches(req, res)));
router.post('/preferences', authenticateJWT, routeHandler((req, res) => matchController.saveMatchPreference(req, res)));
router.get('/history', authenticateJWT, routeHandler((req, res) => matchController.getMatchHistory(req, res)));

export default router; 