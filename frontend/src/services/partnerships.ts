import api from './api';
import { Collaboration } from '../types';

// Helper function to convert partnership data from the API to the Collaboration format
const formatPartnership = (partnership: any): Collaboration => {
  return {
    id: partnership.id,
    title: partnership.title,
    participants: partnership.participants,
    status: partnership.status,
    description: partnership.description,
    type: 'partnership',
    partnershipDetails: {
      duration: partnership.duration || '',
      resources: partnership.resources || '',
      expectedOutcomes: partnership.expectedOutcomes || '',
    },
    createdById: partnership.createdById,
    createdAt: new Date(partnership.createdAt),
    updatedAt: new Date(partnership.updatedAt),
  };
};

/**
 * Get all partnerships
 * @returns Promise with the partnerships
 */
export const getAllPartnerships = async (): Promise<Collaboration[]> => {
  try {
    const response = await api.get('/partnerships');
    
    // Check if response.data and response.data.data exist and are arrays
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Convert each partnership to the Collaboration format
      return response.data.data.map(formatPartnership);
    } else {
      console.warn('API response for partnerships is not in the expected format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return [];
  }
};

/**
 * Get a partnership by ID
 * @param id Partnership ID
 * @returns Promise with the partnership
 */
export const getPartnershipById = async (id: string): Promise<Collaboration> => {
  const response = await api.get(`/partnerships/${id}`);
  return formatPartnership(response.data.data);
};

/**
 * Create a new partnership
 * @param data Partnership data
 * @returns Promise with the created partnership
 */
export const createPartnership = async (data: Partial<Collaboration>): Promise<Collaboration> => {
  const response = await api.post('/partnerships', data);
  return formatPartnership(response.data.data);
};

/**
 * Update a partnership
 * @param id Partnership ID
 * @param data Partnership data to update
 * @returns Promise with the updated partnership
 */
export const updatePartnership = async (id: string, data: Partial<Collaboration>): Promise<Collaboration> => {
  const response = await api.put(`/partnerships/${id}`, data);
  return formatPartnership(response.data.data);
};

/**
 * Delete a partnership
 * @param id Partnership ID
 * @returns Promise with the deletion response
 */
export const deletePartnership = async (id: string): Promise<any> => {
  const response = await api.delete(`/partnerships/${id}`);
  return response.data;
}; 