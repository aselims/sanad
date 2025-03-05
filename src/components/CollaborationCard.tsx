import React from 'react';
import { Users, Calendar, ArrowRight, UserPlus, Target, Handshake } from 'lucide-react';
import type { Collaboration } from '../types';

interface CollaborationCardProps {
  collaboration: Collaboration;
  onViewDetails: (id: string) => void;
}

export function CollaborationCard({ collaboration, onViewDetails }: CollaborationCardProps) {
  const openRequests = collaboration.collaborationRequests?.filter(r => r.status === 'open').length || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{collaboration.title}</h3>
        <div className="flex items-center gap-2">
          {openRequests > 0 && (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
              <UserPlus className="h-3 w-3" />
              {openRequests} open roles
            </span>
          )}
          {collaboration.type === 'challenge' && (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Challenge
            </span>
          )}
          {collaboration.type === 'partnership' && (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
              <Handshake className="h-3 w-3" />
              Partnership
            </span>
          )}
          <span className={`px-2 py-1 text-xs rounded-full ${
            collaboration.status === 'proposed'
              ? 'bg-blue-100 text-blue-800'
              : collaboration.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {collaboration.status}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{collaboration.description}</p>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          <span className="text-sm">{collaboration.participants.length} Participants</span>
        </div>
        <div className="flex items-center text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="text-sm">Active</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex -space-x-2">
          {collaboration.participants.slice(0, 3).map((_, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
            >
              <span className="text-xs text-indigo-600 font-medium">
                {String.fromCharCode(65 + index)}
              </span>
            </div>
          ))}
          {collaboration.participants.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
              <span className="text-xs text-gray-600 font-medium">
                +{collaboration.participants.length - 3}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onViewDetails(collaboration.id)}
          className="flex items-center text-indigo-600 hover:text-indigo-700"
        >
          View Workspace
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}