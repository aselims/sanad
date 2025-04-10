import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMatchRequests, getPotentialMatches } from '../services/matches';
import type { Innovator } from '../types';

interface ProfileData {
  matchRequests: any[];
  potentialMatches: Innovator[];
  isLoading: boolean;
  error: string | null;
}

export const useProfileData = (id?: string): ProfileData => {
  const { user: currentUser } = useAuth();
  const [matchRequests, setMatchRequests] = useState<any[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<Innovator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useProfileData hook called with:', { 
    id, 
    currentUserId: currentUser?.id,
    isOwnProfile: currentUser && id === currentUser.id
  });

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch profile data if this is the current user's profile
      if (currentUser && id && currentUser.id === id) {
        setIsLoading(true);
        console.log('Fetching profile data for user:', id);
        try {
          const [matchRequestsData, potentialMatchesData] = await Promise.all([
            getMatchRequests(id),
            getPotentialMatches(id)
          ]);
          
          setMatchRequests(matchRequestsData);
          setPotentialMatches(potentialMatchesData);
          setError(null);
          console.log('Profile data loaded successfully');
        } catch (err) {
          console.error('Error fetching profile data:', err);
          setError('Failed to load profile data. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [currentUser, id]);

  return {
    matchRequests,
    potentialMatches,
    isLoading,
    error
  };
}; 