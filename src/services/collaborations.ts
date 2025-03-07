import { Collaboration, Challenge, challengeToCollaboration } from '../types';
import { getAllChallenges } from './challenges';
import { getAllPartnerships } from './partnerships';

/**
 * Get all collaborations (both challenges and partnerships)
 * @returns Promise with all collaborations
 */
export const getAllCollaborations = async (): Promise<Collaboration[]> => {
  try {
    // Get challenges and convert them to collaboration format
    const challenges = await getAllChallenges();
    const challengeCollaborations = challenges.map(challengeToCollaboration);
    
    // Get partnerships (already in collaboration format)
    const partnerships = await getAllPartnerships();
    
    // Combine both types of collaborations
    return [...challengeCollaborations, ...partnerships];
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
  const allCollaborations = await getAllCollaborations();
  return allCollaborations.filter(collab => collab.type === type);
};

/**
 * Get collaborations filtered by status
 * @param status Status of collaboration ('proposed', 'active', or 'completed')
 * @returns Promise with filtered collaborations
 */
export const getCollaborationsByStatus = async (status: 'proposed' | 'active' | 'completed'): Promise<Collaboration[]> => {
  const allCollaborations = await getAllCollaborations();
  return allCollaborations.filter(collab => collab.status === status);
};

/**
 * Search collaborations by keyword
 * @param query Search query
 * @returns Promise with matching collaborations
 */
export const searchCollaborations = async (query: string): Promise<Collaboration[]> => {
  const allCollaborations = await getAllCollaborations();
  const lowerQuery = query.toLowerCase();
  
  return allCollaborations.filter(collab => 
    collab.title.toLowerCase().includes(lowerQuery) || 
    collab.description.toLowerCase().includes(lowerQuery) ||
    collab.participants.some(p => p.toLowerCase().includes(lowerQuery))
  );
}; 