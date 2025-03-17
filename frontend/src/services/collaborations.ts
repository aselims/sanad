import { Collaboration } from '../types';
import { challengeToCollaboration } from '../types';
import { getAllChallenges } from './challenges';
import { getAllPartnerships } from './partnerships';
import { getAllIdeas } from './ideas';
import api from './api';

/**
 * Get all collaborations (challenges, partnerships, and ideas)
 * @returns Promise with all collaborations
 */
export const getAllCollaborations = async (): Promise<Collaboration[]> => {
  try {
    // Get challenges and convert them to collaboration format
    const challenges = await getAllChallenges();
    console.log('Fetched challenges:', challenges.length);
    const challengeCollaborations = challenges.map(challengeToCollaboration);
    
    // Get partnerships (already in collaboration format)
    const partnerships = await getAllPartnerships();
    console.log('Fetched partnerships:', partnerships.length);
    
    // Get ideas from the ideas service
    const ideas = await getAllIdeas();
    console.log('Fetched ideas:', ideas.length);
    
    // Combine all types of collaborations
    const allCollaborations = [...challengeCollaborations, ...partnerships, ...ideas];
    console.log('Total collaborations:', allCollaborations.length);
    
    return allCollaborations;
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return [];
  }
};

/**
 * Get collaborations filtered by type
 * @param type Type of collaboration ('challenge' or 'partnership')
 * @returns Promise with filtered collaborations
 */
export const getCollaborationsByType = async (type: 'challenge' | 'partnership'): Promise<Collaboration[]> => {
  try {
    const allCollaborations = await getAllCollaborations();
    const filtered = allCollaborations.filter(collab => collab.type === type);
    console.log(`Filtered collaborations by type '${type}':`, filtered.length);
    return filtered;
  } catch (error) {
    console.error(`Error fetching collaborations by type '${type}':`, error);
    return [];
  }
};

/**
 * Get collaborations filtered by status
 * @param status Status of collaboration ('proposed', 'active', or 'completed')
 * @returns Promise with filtered collaborations
 */
export const getCollaborationsByStatus = async (status: 'proposed' | 'active' | 'completed'): Promise<Collaboration[]> => {
  try {
    const allCollaborations = await getAllCollaborations();
    const filtered = allCollaborations.filter(collab => collab.status === status);
    console.log(`Filtered collaborations by status '${status}':`, filtered.length);
    return filtered;
  } catch (error) {
    console.error(`Error fetching collaborations by status '${status}':`, error);
    return [];
  }
};

/**
 * Search collaborations by keyword
 * @param query Search query
 * @returns Promise with matching collaborations
 */
export const searchCollaborations = async (query: string): Promise<Collaboration[]> => {
  try {
    console.log(`Searching collaborations for: ${query}`);
    const response = await api.get(`/collaborations/search?q=${encodeURIComponent(query)}`);
    
    // Map the response data to ensure it matches the Collaboration interface
    const collaborations = response.data.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      participants: item.participants || [],
      status: item.status,
      type: item.type,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      // Add any other fields that might be needed
      ...(item.type === 'challenge' && item.challengeDetails ? { challengeDetails: item.challengeDetails } : {}),
      ...(item.type === 'partnership' && item.partnershipDetails ? { partnershipDetails: item.partnershipDetails } : {})
    }));
    
    console.log(`Found ${collaborations.length} collaborations matching "${query}"`);
    return collaborations;
  } catch (error: any) {
    console.error(`Error searching collaborations for '${query}':`, error);
    
    // Log more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    // Fallback to client-side search if the API endpoint fails
    try {
      console.log('Falling back to client-side search...');
      const allCollaborations = await getAllCollaborations();
      const lowerQuery = query.toLowerCase();
      
      const filtered = allCollaborations.filter(collab => 
        collab.title.toLowerCase().includes(lowerQuery) || 
        collab.description.toLowerCase().includes(lowerQuery) ||
        collab.participants.some(p => p.toLowerCase().includes(lowerQuery))
      );
      
      console.log(`Fallback search found ${filtered.length} results for '${query}'`);
      return filtered;
    } catch (fallbackError) {
      console.error(`Fallback search also failed for '${query}':`, fallbackError);
      return [];
    }
  }
};

/**
 * Save a vote for a collaboration
 * @param collaborationId The ID of the collaboration
 * @param voteType The type of vote ('up' or 'down')
 * @returns Promise with the updated collaboration
 */
export const saveVote = async (collaborationId: string, voteType: 'up' | 'down'): Promise<any> => {
  try {
    const response = await api.post(`/collaborations/${collaborationId}/vote`, { voteType });
    return response.data;
  } catch (error: any) {
    console.error('Error saving vote:', error);
    throw error;
  }
};

/**
 * Get collaborations for a specific user
 * @param userId ID of the user
 * @returns Promise with the user's collaborations
 */
export const getUserCollaborations = async (userId: string): Promise<Collaboration[]> => {
  try {
    const response = await api.get(`/users/${userId}/collaborations`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user collaborations:', error);
    
    // Fallback to client-side filtering if the API endpoint fails
    try {
      console.log('Falling back to client-side filtering for user collaborations...');
      const allCollaborations = await getAllCollaborations();
      
      // Filter collaborations where the user is a participant
      const userCollaborations = allCollaborations.filter(collab => 
        collab.participants.some(p => p === userId)
      );
      
      return userCollaborations;
    } catch (fallbackError) {
      console.error('Fallback filtering also failed:', fallbackError);
      return [];
    }
  }
}; 