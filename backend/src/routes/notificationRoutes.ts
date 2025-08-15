import express, { Request, Response, NextFunction } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();
const notificationController = new NotificationController();

// Wrapper function to handle async controller methods
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// All notification routes require authentication
router.use(authenticateJWT);

// Get all notifications for the authenticated user
router.get(
  '/',
  asyncHandler((req: Request, res: Response) => notificationController.getNotifications(req, res))
);

// Get unread notification count
router.get(
  '/unread-count',
  asyncHandler((req: Request, res: Response) => notificationController.getUnreadCount(req, res))
);

// Mark a notification as read
router.patch(
  '/:id/read',
  asyncHandler((req: Request, res: Response) => notificationController.markAsRead(req, res))
);

// Mark all notifications as read
router.patch(
  '/read-all',
  asyncHandler((req: Request, res: Response) => notificationController.markAllAsRead(req, res))
);

export default router;
