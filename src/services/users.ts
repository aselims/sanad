import api from './api';
import { Innovator, User, userToInnovator } from '../types';

/**
 * Get all users
 * @returns Promise with the users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Get a user by ID
 * @param id User ID
 * @returns Promise with the user
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

/**
 * Update a user's profile
 * @param id User ID
 * @param data User data to update
 * @returns Promise with the updated user
 */
export const updateUserProfile = async (id: string, data: Partial<User>): Promise<User | null> => {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

/**
 * Update the current user's profile
 * @param data User data to update
 * @returns Promise with the updated user
 */
export const updateCurrentUserProfile = async (data: Partial<User>): Promise<User | null> => {
  try {
    const response = await api.put('/users/me', data);
    
    // Update the user in local storage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...response.data.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating current user profile:', error);
    return null;
  }
};

/**
 * Connect with another user
 * @param userId ID of the user to connect with
 * @returns Promise with the connection response
 */
export const connectWithUser = async (userId: string): Promise<any> => {
  try {
    const response = await api.post(`/connections/request`, { targetUserId: userId });
    return response.data;
  } catch (error) {
    console.error('Error connecting with user:', error);
    throw error;
  }
};

/**
 * Send a message to another user
 * @param userId ID of the user to message
 * @param message Message content
 * @returns Promise with the message response
 */
export const sendMessageToUser = async (userId: string, message: string): Promise<any> => {
  try {
    const response = await api.post(`/messages`, { recipientId: userId, content: message });
    return response.data;
  } catch (error) {
    console.error('Error sending message to user:', error);
    throw error;
  }
}; 