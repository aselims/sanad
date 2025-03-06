import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateJWT, authController.getCurrentUser);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticateJWT, authController.changePassword);

export default router; 