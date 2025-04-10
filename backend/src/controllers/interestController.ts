import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Message } from '../entities/Message';
import { sendInterestNotification } from '../services/integrations/notificationIntegrations';

/**
 * Submit interest in a collaboration or opportunity
 * @route POST /api/interest/submit
 */
export const submitInterest = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated'
      });
    }

    const { 
      entityId, 
      entityType, 
      entityTitle, 
      ownerId, 
      message,
      additionalInfo 
    } = req.body;
    
    if (!entityId || !entityType || !ownerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Entity ID, entity type, and owner ID are required'
      });
    }

    // Get user info
    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOne({ where: { id: req.user.id } });
    const owner = await userRepository.findOne({ where: { id: ownerId } });
    
    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    // Send notification
    await sendInterestNotification(
      ownerId,
      req.user.id,
      entityId,
      entityType,
      entityTitle
    );

    // Create a message
    const messageRepository = AppDataSource.getRepository(Message);
    
    // Format user name for display
    const userName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email.split('@')[0];
    
    // Create a message title
    const messageTitle = `Interest in your ${entityType}: ${entityTitle}`;
    
    // Build the message content 
    const messageContent = `
✨ ${messageTitle} ✨

${userName} has expressed interest in your ${entityType}!

-------------------------------------------------
📋 CONTACT INFORMATION
-------------------------------------------------
• Name: ${currentUser.firstName} ${currentUser.lastName} 
• Email: ${currentUser.email}
• Organization: ${currentUser.organization || 'Not specified'}
• Type: ${currentUser.role || 'Individual'}
${additionalInfo ? `\n${additionalInfo}` : ''}

-------------------------------------------------
💬 MESSAGE FROM INTERESTED PARTY
-------------------------------------------------
${message || 'No additional message provided.'}

-------------------------------------------------
You can respond directly to this message to contact them.
`;

    // Save the message
    const newMessage = messageRepository.create({
      senderId: req.user.id,
      receiverId: ownerId,
      content: messageContent,
      isRead: false
    });

    await messageRepository.save(newMessage);

    return res.status(201).json({
      status: 'success',
      message: 'Interest submitted successfully',
      data: {
        messageId: newMessage.id
      }
    });
  } catch (error) {
    console.error('Error submitting interest:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}; 