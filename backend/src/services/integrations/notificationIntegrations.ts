import { NotificationService } from '../notificationService';
import { User } from '../../entities/User';
import { AppDataSource } from '../../config/data-source';

const notificationService = new NotificationService();
const userRepository = AppDataSource.getRepository(User);

/**
 * Integrates with the message service to send notifications for new messages
 * @param receiverId Recipient user ID
 * @param senderId Sender user ID
 * @param messageContent Message content
 */
export async function sendMessageNotification(
  receiverId: string,
  senderId: string,
  messageContent: string
): Promise<void> {
  try {
    const sender = await userRepository.findOne({
      where: { id: senderId }
    });

    if (!sender) {
      throw new Error('Sender not found');
    }

    const senderName = `${sender.firstName} ${sender.lastName}`.trim() || sender.email.split('@')[0];
    
    // Create message preview (truncate if too long)
    const messagePreview = messageContent.length > 100 
      ? `${messageContent.substring(0, 97)}...` 
      : messageContent;

    await notificationService.createMessageNotification(
      receiverId,
      senderName,
      messagePreview,
      senderId
    );
  } catch (error) {
    console.error('Error sending message notification:', error);
    // Don't throw - notification failures shouldn't block the main functionality
  }
}

/**
 * Integrates with the connection service to send notifications for connection requests
 * @param receiverId Recipient user ID
 * @param senderId Requester user ID
 * @param connectionRequestId Connection request ID
 */
export async function sendConnectionRequestNotification(
  receiverId: string,
  senderId: string,
  connectionRequestId: string
): Promise<void> {
  try {
    const sender = await userRepository.findOne({
      where: { id: senderId }
    });

    if (!sender) {
      throw new Error('Sender not found');
    }

    const senderName = `${sender.firstName} ${sender.lastName}`.trim() || sender.email.split('@')[0];

    await notificationService.createConnectionRequestNotification(
      receiverId,
      senderName,
      connectionRequestId,
      senderId
    );
  } catch (error) {
    console.error('Error sending connection request notification:', error);
    // Don't throw - notification failures shouldn't block the main functionality
  }
}

/**
 * Integrates with the connection service to send notifications for accepted connection requests
 * @param receiverId User ID to notify (the original requester)
 * @param acceptorId User ID who accepted the request
 * @param connectionId Connection ID
 */
export async function sendConnectionAcceptedNotification(
  receiverId: string,
  acceptorId: string,
  connectionId: string
): Promise<void> {
  try {
    const acceptor = await userRepository.findOne({
      where: { id: acceptorId }
    });

    if (!acceptor) {
      throw new Error('Acceptor not found');
    }

    const acceptorName = `${acceptor.firstName} ${acceptor.lastName}`.trim() || acceptor.email.split('@')[0];

    await notificationService.createConnectionAcceptedNotification(
      receiverId,
      acceptorName,
      connectionId,
      acceptorId
    );
  } catch (error) {
    console.error('Error sending connection accepted notification:', error);
    // Don't throw - notification failures shouldn't block the main functionality
  }
}

/**
 * Integrates with the collaboration service to send notifications for interest expressions
 * @param ownerId Owner user ID
 * @param interestedPartyId User ID expressing interest
 * @param entityId Entity ID (challenge, partnership, etc.)
 * @param entityType Entity type (challenge, partnership, etc.)
 * @param entityTitle Entity title
 */
export async function sendInterestNotification(
  ownerId: string,
  interestedPartyId: string,
  entityId: string,
  entityType: string,
  entityTitle: string
): Promise<void> {
  try {
    const interestedParty = await userRepository.findOne({
      where: { id: interestedPartyId }
    });

    if (!interestedParty) {
      throw new Error('Interested party not found');
    }

    const interestedPartyName = `${interestedParty.firstName} ${interestedParty.lastName}`.trim() || 
      interestedParty.email.split('@')[0];

    await notificationService.createInterestNotification(
      ownerId,
      interestedPartyName,
      entityId,
      entityType,
      entityTitle
    );
  } catch (error) {
    console.error('Error sending interest notification:', error);
    // Don't throw - notification failures shouldn't block the main functionality
  }
} 