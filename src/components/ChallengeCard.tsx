import React from 'react';
import { ArrowRight, Users } from 'lucide-react';
import type { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onViewDetails: (id: string) => void;
}

export function ChallengeCard({ challenge, onViewDetails }: ChallengeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          challenge.status === 'open' 
            ? 'bg-green-100 text-green-800'
            : challenge.status === 'in-progress'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {challenge.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          <span className="text-sm">{challenge.organization}</span>
        </div>
        
        <button
          onClick={() => onViewDetails(challenge.id)}
          className="flex items-center text-indigo-600 hover:text-indigo-700"
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}