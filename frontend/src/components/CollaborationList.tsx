import React from 'react';
import { CollaborationCard } from './CollaborationCard';
import { CollaborationListItem } from './CollaborationListItem';
import type { Collaboration } from '../types';
import { useCollaborations } from '../contexts/CollaborationContext';

interface CollaborationListProps {
  onViewDetails: (id: string) => void;
  viewMode?: 'grid' | 'list';
  useFilteredCollaborations?: boolean;
  collaborations?: Collaboration[];
}

export function CollaborationList({ 
  onViewDetails, 
  viewMode, 
  useFilteredCollaborations = true,
  collaborations: propsCollaborations
}: CollaborationListProps) {
  const { filteredCollaborations, viewMode: contextViewMode } = useCollaborations();
  
  // Use either the filtered collaborations from context or the passed in collaborations
  const displayCollaborations = propsCollaborations || 
    (useFilteredCollaborations ? filteredCollaborations : []);
  
  // Use the viewMode from props, or fall back to the one from context
  const currentViewMode = viewMode || contextViewMode;
  
  // Add console log for debugging
  console.log('CollaborationList rendering with:', displayCollaborations, 'viewMode:', currentViewMode);
  
  // Show a message when no collaborations are available
  if (!displayCollaborations || displayCollaborations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No collaborations available. Create a new one to get started!</p>
      </div>
    );
  }
  
  if (currentViewMode === 'list') {
    return (
      <div className="space-y-4">
        {displayCollaborations.map((collaboration) => (
          <CollaborationListItem
            key={collaboration.id}
            collaboration={collaboration}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCollaborations.map((collaboration) => (
        <CollaborationCard
          key={collaboration.id}
          collaboration={collaboration}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}