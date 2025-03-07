import api from './api';
import { Challenge } from '../types';

/**
 * Get all challenges
 * @returns Promise with the challenges
 */
export const getAllChallenges = async (): Promise<Challenge[]> => {
  const response = await api.get('/challenges');
  return response.data.data;
};

/**
 * Get a challenge by ID
 * @param id Challenge ID
 * @returns Promise with the challenge
 */
export const getChallengeById = async (id: string): Promise<Challenge> => {
  const response = await api.get(`/challenges/${id}`);
  return response.data.data;
};

/**
 * Create a new challenge
 * @param data Challenge data
 * @returns Promise with the created challenge
 */
export const createChallenge = async (data: Partial<Challenge>): Promise<Challenge> => {
  const response = await api.post('/challenges', data);
  return response.data.data;
};

/**
 * Update a challenge
 * @param id Challenge ID
 * @param data Challenge data to update
 * @returns Promise with the updated challenge
 */
export const updateChallenge = async (id: string, data: Partial<Challenge>): Promise<Challenge> => {
  const response = await api.put(`/challenges/${id}`, data);
  return response.data.data;
};

/**
 * Delete a challenge
 * @param id Challenge ID
 * @returns Promise with the deletion response
 */
export const deleteChallenge = async (id: string): Promise<any> => {
  const response = await api.delete(`/challenges/${id}`);
  return response.data;
}; 