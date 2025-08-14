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
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    const innovators = response.data.data.map(userToInnovator);
    return innovators;
  } catch (error) {
    console.error(`Error searching innovators for '${query}':`, error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Fallback to client-side search if the API endpoint fails
    try {
      const allInnovators = await getAllInnovators();
      const lowerQuery = query.toLowerCase();
      
      const filtered = allInnovators.filter(innovator => 
        innovator.name.toLowerCase().includes(lowerQuery) || 
        innovator.description.toLowerCase().includes(lowerQuery) ||
        innovator.organization.toLowerCase().includes(lowerQuery) ||
        innovator.type.toLowerCase().includes(lowerQuery) ||
        innovator.expertise.some(exp => exp.toLowerCase().includes(lowerQuery))
      );
      
      return filtered;
    } catch (fallbackError) {
      console.error(`Fallback search for innovators also failed for '${query}':`, fallbackError);
      return [];
    }
  }
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