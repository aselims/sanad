import api from './api';
import { Innovator, User, userToInnovator } from '../types';
import { findPotentialMatches } from '../utils/matchUtils';

/**
 * Get potential matches for a user
 * @param userId ID of the user to find matches for
 * @returns Promise with the potential matches
 */
export const getPotentialMatches = async (userId: string): Promise<Innovator[]> => {
  try {
    // First, get the current user's full profile
    const currentUserResponse = await api.get(`/users/${userId}`);
    const currentUser = currentUserResponse.data.data;

    // Then, get all other users
    const allUsersResponse = await api.get('/users');
    const allUsers = allUsersResponse.data.data;

    // Convert users to innovators format
    const currentInnovator = userToInnovator(currentUser);
    const otherInnovators = allUsers
      .filter((user: User) => user.id !== userId)
      .map((user: User) => userToInnovator(user));

    // Use our matching algorithm to find potential matches
    const matches = findPotentialMatches(currentInnovator, otherInnovators);

    return matches.map(match => match.innovator);
  } catch (error) {
    console.error('Error fetching potential matches:', error);
    return [];
  }
};

/**
 * Save a match preference (like/dislike)
 * @param userId ID of the current user
 * @param targetUserId ID of the matched user
 * @param preference 'like' or 'dislike'
 * @returns Promise with the response
 */
export const saveMatchPreference = async (
  userId: string,
  targetUserId: string,
  preference: 'like' | 'dislike'
): Promise<any> => {
  try {
    const response = await api.post('/matches/preferences', {
      userId,
      targetUserId,
      preference
    });
    return response.data;
  } catch (error) {
    console.error('Error saving match preference:', error);
    throw error;
  }
};

/**
 * Get match history for a user
 * @param userId ID of the user
 * @returns Promise with the match history
 */
export const getMatchHistory = async (userId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/matches/history/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching match history:', error);
    return [];
  }
}; 