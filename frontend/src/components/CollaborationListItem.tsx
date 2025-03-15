import React, { useState } from 'react';
import { Users, Calendar, ArrowRight, UserPlus, Target, Handshake, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Collaboration } from '../types';
import { saveVote } from '../services/collaborations';

interface CollaborationListItemProps {
  collaboration: Collaboration;
  onViewDetails: (id: string) => void;
}

export function CollaborationListItem({ collaboration, onViewDetails }: CollaborationListItemProps) {
  const openRequests = collaboration.collaborationRequests?.filter(r => r.status === 'open').length || 0;
  const [votes, setVotes] = useState({ upvotes: collaboration.upvotes || 0, downvotes: collaboration.downvotes || 0 });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = async (voteType: 'up' | 'down') => {
    // If user already voted this way, remove the vote
    if (userVote === voteType) {
      setVotes(prev => ({
        ...prev,
        [voteType === 'up' ? 'upvotes' : 'downvotes']: Math.max(0, prev[voteType === 'up' ? 'upvotes' : 'downvotes'] - 1)
      }));
      setUserVote(null);
    } 
    // If user voted the opposite way, switch the vote
    else if (userVote !== null) {
      setVotes(prev => ({
        upvotes: voteType === 'up' ? prev.upvotes + 1 : Math.max(0, prev.upvotes - 1),
        downvotes: voteType === 'down' ? prev.downvotes + 1 : Math.max(0, prev.downvotes - 1)
      }));
      setUserVote(voteType);
    } 
    // If user hasn't voted yet, add a new vote
    else {
      setVotes(prev => ({
        ...prev,
        [voteType === 'up' ? 'upvotes' : 'downvotes']: prev[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1
      }));
      setUserVote(voteType);
    }

    // Save the vote to the database
    try {
      await saveVote(collaboration.id, voteType);
    } catch (error) {
      console.error('Failed to save vote:', error);
      // Optionally revert the UI state if the API call fails
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">{collaboration.title}</h3>
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
              {collaboration.type === 'idea' && (
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Idea
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
          
          <p className="text-gray-600 mb-3 line-clamp-2">{collaboration.description}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{collaboration.participants.length} Participants</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-between items-end ml-4">
          <div className="flex items-center gap-2 mb-4">
            <button 
              onClick={() => handleVote('up')}
              className={`p-1 rounded-full hover:bg-gray-100 ${userVote === 'up' ? 'text-green-600' : 'text-gray-400'}`}
              aria-label="Upvote"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-gray-600">{votes.upvotes}</span>
            
            <button 
              onClick={() => handleVote('down')}
              className={`p-1 rounded-full hover:bg-gray-100 ${userVote === 'down' ? 'text-red-600' : 'text-gray-400'}`}
              aria-label="Downvote"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-gray-600">{votes.downvotes}</span>
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
    </div>
  );
} 