import React from 'react';
import { CollaborationCard } from './CollaborationCard';
import type { Collaboration } from '../types';

interface CollaborationListProps {
  collaborations: Collaboration[];
  onViewDetails: (id: string) => void;
}

export function CollaborationList({ collaborations, onViewDetails }: CollaborationListProps) {
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