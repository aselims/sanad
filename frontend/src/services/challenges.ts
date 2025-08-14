import api from './api';
import { Challenge, challengeToCollaboration } from '../types';

/**
 * Get all challenges
 * @returns Promise with the challenges
 */
export const getAllChallenges = async (): Promise<Challenge[]> => {
  try {
    const response = await api.get('/challenges');
    
    // Check if response.data and response.data.data exist and are arrays
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map((challenge: any) => ({
        ...challenge,
        createdAt: new Date(challenge.createdAt),
        updatedAt: new Date(challenge.updatedAt)
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
};

/**
 * Get a challenge by ID
 * @param id Challenge ID
 * @returns Promise with the challenge
 */
export const getChallengeById = async (id: string): Promise<Challenge> => {
  const response = await api.get(`/challenges/${id}`);
  const challenge = response.data.data;
  return {
    ...challenge,
    createdAt: new Date(challenge.createdAt),
    updatedAt: new Date(challenge.updatedAt)
  };
};

/**
 * Create a new challenge
 * @param data Challenge data
 * @returns Promise with the created challenge
 */
export const createChallenge = async (data: Partial<Challenge>): Promise<Challenge> => {
  const response = await api.post('/challenges', data);
  const challenge = response.data.data;
  return {
    ...challenge,
    createdAt: new Date(challenge.createdAt),
    updatedAt: new Date(challenge.updatedAt)
  };
};

/**
 * Update a challenge
 * @param id Challenge ID
 * @param data Challenge data to update
 * @returns Promise with the updated challenge
 */
export const updateChallenge = async (id: string, data: Partial<Challenge>): Promise<Challenge> => {
  const response = await api.put(`/challenges/${id}`, data);
  const challenge = response.data.data;
  return {
    ...challenge,
    createdAt: new Date(challenge.createdAt),
    updatedAt: new Date(challenge.updatedAt)
  };
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