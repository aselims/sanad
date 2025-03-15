import api from './api';
import { Innovator, User, userToInnovator } from '../types';
import { sendConnectionRequest } from './connections';
import { sendMessage } from './messages';

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
    
    // Also update any additional profile data in a separate storage if needed
    // This is useful for storing data that might not be part of the User model
    // but is part of the Innovator model in the frontend
    const additionalProfileData = {
      profileImage: data.profilePicture,
      website: data.website,
      location: data.location,
      social: data.social,
      allowMessages: data.allowMessages,
      // Add any other fields that are not part of the User model
    };
    
    // Store additional profile data
    localStorage.setItem('profileData', JSON.stringify({
      ...JSON.parse(localStorage.getItem('profileData') || '{}'),
      ...additionalProfileData
    }));
    
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
  return sendConnectionRequest(userId);
};

/**
 * Send a message to another user
 * @param userId ID of the user to message
 * @param message Message content
 * @returns Promise with the message response
 */
export const sendMessageToUser = async (userId: string, message: string): Promise<any> => {
  return sendMessage(userId, message);
}; 