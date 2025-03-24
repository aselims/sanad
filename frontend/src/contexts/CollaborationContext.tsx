import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Collaboration } from '../types';
import { getAllCollaborations, saveVote } from '../services/collaborations';

interface CollaborationContextType {
  collaborations: Collaboration[];
  filteredCollaborations: Collaboration[];
  activeFilter: 'all' | 'challenges' | 'partnerships' | 'ideas';
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  setFilter: (filter: 'all' | 'challenges' | 'partnerships' | 'ideas') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  addCollaboration: (collaboration: Collaboration) => void;
  updateCollaboration: (collaboration: Collaboration) => void;
  removeCollaboration: (id: string) => void;
  voteForCollaboration: (id: string, voteType: 'up' | 'down') => Promise<void>;
  getCollaborationById: (id: string) => Collaboration | undefined;
  refreshCollaborations: () => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaborations = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaborations must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'challenges' | 'partnerships' | 'ideas'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter collaborations based on active filter
  const filteredCollaborations = collaborations.filter(collaboration => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'challenges' && collaboration.type === 'challenge') return true;
    if (activeFilter === 'partnerships' && collaboration.type === 'partnership') return true;
    if (activeFilter === 'ideas' && collaboration.type === 'idea') return true;
    return false;
  });

  // Fetch collaborations from API
  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const data = await getAllCollaborations();
      setCollaborations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching collaborations:', err);
      setError('Failed to load collaborations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchCollaborations();
  }, []);

  // Set filter
  const setFilter = (filter: 'all' | 'challenges' | 'partnerships' | 'ideas') => {
    setActiveFilter(filter);
  };

  // Add a new collaboration
  const addCollaboration = (collaboration: Collaboration) => {
    setCollaborations(prevCollaborations => [collaboration, ...prevCollaborations]);
  };

  // Update an existing collaboration
  const updateCollaboration = (updatedCollaboration: Collaboration) => {
    setCollaborations(prevCollaborations => 
      prevCollaborations.map(collaboration => 
        collaboration.id === updatedCollaboration.id 
          ? updatedCollaboration 
          : collaboration
      )
    );
  };

  // Remove a collaboration
  const removeCollaboration = (id: string) => {
    setCollaborations(prevCollaborations => 
      prevCollaborations.filter(collaboration => collaboration.id !== id)
    );
  };

  // Vote for a collaboration
  const voteForCollaboration = async (id: string, voteType: 'up' | 'down') => {
    try {
      // Find the collaboration to update
      const collaborationToUpdate = collaborations.find(c => c.id === id);
      if (!collaborationToUpdate) return;

      // Create a copy to update
      const updatedCollaboration = { ...collaborationToUpdate };
      
      // Handle upvote
      if (voteType === 'up') {
        updatedCollaboration.upvotes = (updatedCollaboration.upvotes || 0) + 1;
      }
      // Handle downvote
      else if (voteType === 'down') {
        updatedCollaboration.downvotes = (updatedCollaboration.downvotes || 0) + 1;
      }

      // Update the collaborations state
      updateCollaboration(updatedCollaboration);

      // Save the vote to the database
      await saveVote(id, voteType);
    } catch (error) {
      console.error('Failed to save vote:', error);
      // Refresh collaborations to revert any incorrect UI updates
      await fetchCollaborations();
    }
  };

  // Get a specific collaboration by ID
  const getCollaborationById = (id: string) => {
    return collaborations.find(c => c.id === id);
  };

  // Refresh the collaborations data
  const refreshCollaborations = async () => {
    await fetchCollaborations();
  };

  const value = {
    collaborations,
    filteredCollaborations,
    activeFilter,
    loading,
    error,
    viewMode,
    setFilter,
    setViewMode,
    addCollaboration,
    updateCollaboration,
    removeCollaboration,
    voteForCollaboration,
    getCollaborationById,
    refreshCollaborations
  };

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
}; 