import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Innovator, User } from '../types';
import { getAllInnovators } from '../services/innovators';
import { useAuth } from './AuthContext';
import { useProfileData } from '../hooks/useProfileData';

interface ProfileContextType {
  innovators: Innovator[];
  getCurrentUserProfile: () => Innovator | undefined;
  getProfileById: (id: string) => Innovator | undefined;
  isCurrentUserProfile: (id?: string) => boolean;
  loading: boolean;
  error: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [innovators, setInnovators] = useState<Innovator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all innovators from API
  useEffect(() => {
    const fetchInnovators = async () => {
      setLoading(true);
      try {
        const data = await getAllInnovators();
        setInnovators(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching innovators:', err);
        setError('Failed to load innovators. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInnovators();
  }, []);

  // Get the current user's profile
  const getCurrentUserProfile = (): Innovator | undefined => {
    if (!currentUser) return undefined;
    return innovators.find(innovator => innovator.id === currentUser.id);
  };

  // Get a profile by ID
  const getProfileById = (id: string): Innovator | undefined => {
    return innovators.find(innovator => innovator.id === id);
  };

  // Check if a given ID belongs to the current user
  const isCurrentUserProfile = (id?: string): boolean => {
    if (!currentUser || !id) return false;
    return currentUser.id === id;
  };

  const value = {
    innovators,
    getCurrentUserProfile,
    getProfileById,
    isCurrentUserProfile,
    loading,
    error
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}; 