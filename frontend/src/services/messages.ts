import api from './api';
import { Message, Conversation } from '../types';

/**
 * Send a message to another user
 * @param recipientId ID of the user to message
 * @param content Message content
 * @returns Promise with the message response
 */
export const sendMessage = async (recipientId: string, content: string): Promise<Message> => {
  try {
    const response = await api.post('/messages', { recipientId, content });
    return response.data.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get conversation with another user
 * @param userId ID of the user to get conversation with
 * @returns Promise with the messages
 */
export const getConversation = async (userId: string): Promise<Message[]> => {
  try {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return [];
  }
};

/**
 * Get all conversations for the current user
 * @returns Promise with the conversations
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}; 