import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { Connection, ConnectionStatus } from '../entities/Connection';

/**
 * Send a message to another user
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated'
      });
    }

    const { recipientId, content } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient ID and message content are required'
      });
    }

    // Check if recipient exists
    const userRepository = AppDataSource.getRepository(User);
    const recipient = await userRepository.findOne({ where: { id: recipientId } });
    
    if (!recipient) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipient not found'
      });
    }

    // Check if recipient allows messages
    if (!recipient.allowMessages) {
      return res.status(403).json({
        status: 'error',
        message: 'This user does not allow messages'
      });
    }

    // Check if users are connected (optional, depending on your requirements)
    const connectionRepository = AppDataSource.getRepository(Connection);
    const connection = await connectionRepository.findOne({
      where: [
        { requesterId: req.user.id, receiverId: recipientId, status: ConnectionStatus.ACCEPTED },
        { requesterId: recipientId, receiverId: req.user.id, status: ConnectionStatus.ACCEPTED }
      ]
    });

    if (!connection) {
      return res.status(403).json({
        status: 'error',
        message: 'You must be connected with this user to send messages'
      });
    }

    // Create new message
    const messageRepository = AppDataSource.getRepository(Message);
    const newMessage = messageRepository.create({
      senderId: req.user.id,
      receiverId: recipientId,
      content,
      isRead: false
    });

    await messageRepository.save(newMessage);

    return res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get conversation with another user
 */
export const getConversation = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated'
      });
    }

    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    // Get messages between the two users
    const messageRepository = AppDataSource.getRepository(Message);
    const messages = await messageRepository.find({
      where: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ],
      order: { createdAt: 'ASC' }
    });

    // Mark messages as read if current user is the receiver
    const unreadMessages = messages.filter(
      message => message.receiverId === req.user!.id && !message.isRead
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(message => {
        message.isRead = true;
      });
      await messageRepository.save(unreadMessages);
    }

    return res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get all conversations for the current user
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated'
      });
    }

    const messageRepository = AppDataSource.getRepository(Message);
    const userRepository = AppDataSource.getRepository(User);

    // Get all unique users the current user has exchanged messages with
    const sentMessages = await messageRepository
      .createQueryBuilder('message')
      .select('message.receiverId')
      .where('message.senderId = :userId', { userId: req.user.id })
      .distinct(true)
      .getRawMany();

    const receivedMessages = await messageRepository
      .createQueryBuilder('message')
      .select('message.senderId')
      .where('message.receiverId = :userId', { userId: req.user.id })
      .distinct(true)
      .getRawMany();

    // Combine and deduplicate user IDs
    const userIds = [
      ...sentMessages.map(m => m.message_receiverId),
      ...receivedMessages.map(m => m.message_senderId)
    ].filter((value, index, self) => self.indexOf(value) === index);

    // Get the latest message for each conversation
    const conversations = [];
    for (const userId of userIds) {
      const latestMessage = await messageRepository
        .createQueryBuilder('message')
        .where('(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)', 
          { userId1: req.user.id, userId2: userId })
        .orderBy('message.createdAt', 'DESC')
        .getOne();

      if (latestMessage) {
        // Get user details
        const otherUser = await userRepository.findOne({ where: { id: userId } });
        
        // Count unread messages
        const unreadCount = await messageRepository.count({
          where: {
            senderId: userId,
            receiverId: req.user.id,
            isRead: false
          }
        });

        conversations.push({
          userId,
          user: otherUser,
          latestMessage,
          unreadCount
        });
      }
    }

    // Sort conversations by latest message date
    conversations.sort((a, b) => 
      new Date(b.latestMessage.createdAt).getTime() - new Date(a.latestMessage.createdAt).getTime()
    );

    return res.status(200).json({
      status: 'success',
      data: conversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}; 