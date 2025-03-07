import api from './api';
import { Collaboration } from '../types';

/**
 * Get all partnerships
 * @returns Promise with the partnerships
 */
export const getAllPartnerships = async (): Promise<Collaboration[]> => {
  const response = await api.get('/partnerships');
  return response.data.data;
};

/**
 * Get a partnership by ID
 * @param id Partnership ID
 * @returns Promise with the partnership
 */
export const getPartnershipById = async (id: string): Promise<Collaboration> => {
  const response = await api.get(`/partnerships/${id}`);
  return response.data.data;
};

/**
 * Create a new partnership
 * @param data Partnership data
 * @returns Promise with the created partnership
 */
export const createPartnership = async (data: Partial<Collaboration>): Promise<Collaboration> => {
  const response = await api.post('/partnerships', data);
  return response.data.data;
};

/**
 * Update a partnership
 * @param id Partnership ID
 * @param data Partnership data to update
 * @returns Promise with the updated partnership
 */
export const updatePartnership = async (id: string, data: Partial<Collaboration>): Promise<Collaboration> => {
  const response = await api.put(`/partnerships/${id}`, data);
  return response.data.data;
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