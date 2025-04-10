import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { useAuth } from '../contexts/AuthContext';
import { useProfiles } from '../contexts/ProfileContext';
import { useProfileData } from '../hooks/useProfileData';
import type { Innovator } from '../types';

interface ProfilePageWrapperProps {
  onBack: () => void;
}

export function ProfilePageWrapper({ onBack }: ProfilePageWrapperProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { getProfileById, isCurrentUserProfile } = useProfiles();
  
  // Add debugging to see what data is available
  console.log('ProfilePageWrapper debug:', { 
    id, 
    currentUser, 
    pathname: location.pathname
  });
  
  // Get profile data for the current user
  const { matchRequests, potentialMatches, isLoading } = useProfileData(id);
  
  // Find the innovator by ID or use current user's ID
  const innovator = id ? getProfileById(id) : undefined;
  
  // Only use current user as fallback if explicitly viewing own profile (no ID in URL or URL ID matches current user ID)
  const userToDisplay = innovator || 
    (currentUser && (!id || isCurrentUserProfile(id)) ? 
      currentUser as unknown as Innovator : undefined);
  
  console.log('Profile data:', { 
    innovator, 
    currentUser, 
    userToDisplay
  });
  
  if (!userToDisplay) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Profile not found. <button 
            onClick={() => navigate('/')}
            className="underline text-indigo-600 hover:text-indigo-800"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <ProfilePage 
      user={userToDisplay} 
      onBack={onBack} 
      matchRequests={matchRequests}
      potentialMatches={potentialMatches}
      isLoading={isLoading}
    />
  );
} 