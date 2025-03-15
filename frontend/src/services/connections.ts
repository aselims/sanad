import api from './api';
import { Connection } from '../types';

/**
 * Send a connection request to another user
 * @param targetUserId ID of the user to connect with
 * @returns Promise with the connection response
 */
export const sendConnectionRequest = async (targetUserId: string): Promise<Connection> => {
  try {
    const response = await api.post('/connections/request', { targetUserId });
    return response.data.data;
  } catch (error) {
    console.error('Error sending connection request:', error);
    throw error;
  }
};

/**
 * Get all pending connection requests for the current user
 * @returns Promise with the connection requests
 */
export const getConnectionRequests = async (): Promise<Connection[]> => {
  try {
    const response = await api.get('/connections/requests');
    return response.data.data;
  } catch (error) {
    console.error('Error getting connection requests:', error);
    return [];
  }
};

/**
 * Get all connections for the current user
 * @returns Promise with the connections
 */
export const getUserConnections = async (): Promise<any[]> => {
  try {
    const response = await api.get('/connections');
    return response.data.data;
  } catch (error) {
    console.error('Error getting user connections:', error);
    return [];
  }
};

/**
 * Respond to a connection request
 * @param connectionId ID of the connection request
 * @param action 'accept' or 'reject'
 * @returns Promise with the connection response
 */
export const respondToConnectionRequest = async (connectionId: string, action: 'accept' | 'reject'): Promise<Connection> => {
  try {
    const response = await api.post('/connections/respond', { connectionId, action });
    return response.data.data;
  } catch (error) {
    console.error('Error responding to connection request:', error);
    throw error;
  }
}; 