import React from 'react';
import { CollaborationCard } from './CollaborationCard';
import type { Collaboration } from '../types';

interface CollaborationListProps {
  collaborations: Collaboration[];
  onViewDetails: (id: string) => void;
}

export function CollaborationList({ collaborations, onViewDetails }: CollaborationListProps) {
  // Add console log for debugging
  console.log('CollaborationList rendering with:', collaborations);
  
  // Show a message when no collaborations are available
  if (!collaborations || collaborations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No collaborations available. Create a new one to get started!</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collaborations.map((collaboration) => (
        <CollaborationCard
          key={collaboration.id}
          collaboration={collaboration}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}