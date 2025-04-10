import express from 'express';
import { submitInterest } from '../controllers/interestController';
import { authenticateJWT } from '../middlewares/auth';
import { routeHandler } from '../utils/express-types';

const router = express.Router();

/**
 * @route POST /api/interest/submit
 * @desc Submit interest in a collaboration
 * @access Private
 */
router.post('/submit', authenticateJWT, routeHandler(submitInterest));

export default router; 