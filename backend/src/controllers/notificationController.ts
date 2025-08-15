import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  private notificationService = new NotificationService();

  /**
   * Get all notifications for the authenticated user
   * @param req Express request
   * @param res Express response
   */
  async getNotifications(req: Request, res: Response) {
    try {
      // Get user ID from authenticated user
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const notifications = await this.notificationService.getNotifications(userId);

      res.json({
        status: 'success',
        data: notifications,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  /**
   * Get unread notification count for the authenticated user
   * @param req Express request
   * @param res Express response
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      // Get user ID from authenticated user
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.json({
        status: 'success',
        data: { count },
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  /**
   * Mark a notification as read
   * @param req Express request
   * @param res Express response
   */
  async markAsRead(req: Request, res: Response) {
    try {
      // Get user ID from authenticated user
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const notificationId = req.params.id;

      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID is required' });
      }

      const notification = await this.notificationService.markAsRead(notificationId, userId);

      res.json({
        status: 'success',
        data: notification,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);

      if ((error as Error).message === 'Notification not found') {
        return res.status(404).json({ error: 'Notification not found' });
      }

      if ((error as Error).message === 'Unauthorized access to notification') {
        return res.status(403).json({ error: 'Unauthorized access to notification' });
      }

      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  /**
   * Mark all notifications as read for the authenticated user
   * @param req Express request
   * @param res Express response
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      // Get user ID from authenticated user
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const count = await this.notificationService.markAllAsRead(userId);

      res.json({
        status: 'success',
        data: { count },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }
}
