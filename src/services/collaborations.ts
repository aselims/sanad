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
    console.log('Fetched challenges:', challenges.length);
    const challengeCollaborations = challenges.map(challengeToCollaboration);
    
    // Get partnerships (already in collaboration format)
    const partnerships = await getAllPartnerships();
    console.log('Fetched partnerships:', partnerships.length);
    
    // Combine both types of collaborations
    const allCollaborations = [...challengeCollaborations, ...partnerships];
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
    const allCollaborations = await getAllCollaborations();
    const lowerQuery = query.toLowerCase();
    
    const filtered = allCollaborations.filter(collab => 
      collab.title.toLowerCase().includes(lowerQuery) || 
      collab.description.toLowerCase().includes(lowerQuery) ||
      collab.participants.some(p => p.toLowerCase().includes(lowerQuery))
    );
    
    console.log(`Search results for '${query}':`, filtered.length);
    return filtered;
  } catch (error) {
    console.error(`Error searching collaborations for '${query}':`, error);
    return [];
  }
}; 