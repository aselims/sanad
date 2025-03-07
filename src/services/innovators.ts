import api from './api';
import { User, Innovator, userToInnovator } from '../types';

/**
 * Get all innovators
 * @returns Promise with the innovators
 */
export const getAllInnovators = async (): Promise<Innovator[]> => {
  const response = await api.get('/users');
  // Convert User objects to Innovator format
  return response.data.data.map(userToInnovator);
};

/**
 * Get an innovator by ID
 * @param id Innovator ID
 * @returns Promise with the innovator
 */
export const getInnovatorById = async (id: string): Promise<Innovator> => {
  const response = await api.get(`/users/${id}`);
  return userToInnovator(response.data.data);
};

/**
 * Search innovators by criteria
 * @param query Search query
 * @returns Promise with the matching innovators
 */
export const searchInnovators = async (query: string): Promise<Innovator[]> => {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data.data.map(userToInnovator);
};

/**
 * Get innovators by type
 * @param type Innovator type
 * @returns Promise with the innovators of the specified type
 */
export const getInnovatorsByType = async (type: string): Promise<Innovator[]> => {
  const response = await api.get(`/users?role=${encodeURIComponent(type)}`);
  return response.data.data.map(userToInnovator);
}; 