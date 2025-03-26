import { AppDataSource } from '../config/data-source';
import { Notification, NotificationType } from '../entities/Notification';
import { User } from '../entities/User';
import { v4 as uuidv4 } from 'uuid';

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Get all notifications for a user
   * @param userId User ID
   * @returns Array of notifications
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50 // Limit to the 50 most recent notifications
    });
  }

  /**
   * Get unread notification count for a user
   * @param userId User ID
   * @returns Number of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false }
    });
  }

  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @param userId User ID (for security check)
   * @returns Updated notification
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized access to notification');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns Number of notifications updated
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId AND isRead = :isRead', { userId, isRead: false })
      .execute();

    return result.affected || 0;
  }

  /**
   * Create a new notification
   * @param data Notification data
   * @returns Created notification
   */
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      id: uuidv4(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      data: data.data || null
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * Create a message notification
   * @param userId Receiver user ID
   * @param senderName Sender name
   * @param messagePreview Preview of the message
   * @param senderId Sender user ID
   * @returns Created notification
   */
  async createMessageNotification(
    userId: string,
    senderName: string,
    messagePreview: string,
    senderId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.MESSAGE,
      title: `New message from ${senderName}`,
      message: messagePreview,
      data: {
        senderId,
        senderName
      }
    });
  }

  /**
   * Create a connection request notification
   * @param userId Receiver user ID
   * @param senderName Requester name
   * @param requestId Connection request ID
   * @param senderId Requester user ID
   * @returns Created notification
   */
  async createConnectionRequestNotification(
    userId: string,
    senderName: string,
    requestId: string,
    senderId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.CONNECTION,
      title: `Connection request from ${senderName}`,
      message: `${senderName} would like to connect with you.`,
      data: {
        senderId,
        senderName,
        entityId: requestId,
        entityType: 'request'
      }
    });
  }

  /**
   * Create a connection accepted notification
   * @param userId User ID to notify
   * @param acceptorName Name of the user who accepted the request
   * @param connectionId Connection ID
   * @param acceptorId User ID of the acceptor
   * @returns Created notification
   */
  async createConnectionAcceptedNotification(
    userId: string,
    acceptorName: string,
    connectionId: string,
    acceptorId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.CONNECTION,
      title: `${acceptorName} accepted your connection request`,
      message: `You are now connected with ${acceptorName}.`,
      data: {
        senderId: acceptorId,
        senderName: acceptorName,
        entityId: connectionId,
        entityType: 'connection'
      }
    });
  }

  /**
   * Create an interest notification
   * @param userId User ID to notify
   * @param interestedPartyName Name of the interested party
   * @param entityId ID of the entity (challenge, partnership, etc.)
   * @param entityType Type of the entity
   * @param entityTitle Title of the entity
   * @param senderId User ID of the interested party
   * @returns Created notification
   */
  async createInterestNotification(
    userId: string,
    interestedPartyName: string,
    entityId: string,
    entityType: string,
    entityTitle: string,
    senderId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.INTEREST,
      title: `${interestedPartyName} expressed interest in your ${entityType}`,
      message: `${interestedPartyName} is interested in "${entityTitle}".`,
      data: {
        senderId,
        senderName: interestedPartyName,
        entityId,
        entityType,
        entityTitle
      }
    });
  }

  /**
   * Delete old notifications
   * @param daysOld Number of days old to delete
   * @returns Number of notifications deleted
   */
  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
} 