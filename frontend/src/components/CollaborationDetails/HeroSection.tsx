import React from 'react';
import {
  Calendar,
  Tag,
  Rocket,
  ThumbsUp,
  Heart,
  Share2,
  Users,
  Eye,
  Handshake,
  UserPlus,
} from 'lucide-react';
import ProtectedAction from '../auth/ProtectedAction';

interface HeroSectionProps {
  collaboration: any;
  votes: { upvotes: number; downvotes: number };
  userVote: 'up' | 'down' | null;
  isVoting: boolean;
  voteError: string | null;
  openRequests: any[];
  onVote: (type: 'up' | 'down') => void;
  onExpressInterest: () => void;
}

export function HeroSection({
  collaboration,
  votes,
  userVote,
  isVoting,
  voteError,
  openRequests,
  onVote,
  onExpressInterest,
}: HeroSectionProps) {
  return (
    <>
      {/* Hero Header with Gradient Background */}
      <div
        className='relative overflow-hidden'
        style={{
          background: collaboration.color
            ? `linear-gradient(135deg, ${collaboration.color}dd 0%, ${collaboration.color}99 100%)`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className='absolute inset-0 bg-black/10' />
        <div className='relative px-8 py-12'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full capitalize'>
                  {collaboration.type}
                </span>
                {collaboration.status && (
                  <span className='px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full capitalize'>
                    {collaboration.status}
                  </span>
                )}
              </div>

              <h1 className='text-4xl font-bold text-white mb-4'>{collaboration.title}</h1>
              <p className='text-xl text-blue-100 mb-6 leading-relaxed max-w-4xl'>
                {collaboration.description}
              </p>

              {/* Key Metrics Row */}
              <div className='flex flex-wrap gap-6 text-white/90'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  <span className='text-sm'>
                    Created{' '}
                    {new Date(collaboration.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {collaboration.ideaDetails?.category && (
                  <div className='flex items-center gap-2'>
                    <Tag className='h-5 w-5' />
                    <span className='text-sm'>{collaboration.ideaDetails.category}</span>
                  </div>
                )}
                {collaboration.ideaDetails?.stage && (
                  <div className='flex items-center gap-2'>
                    <Rocket className='h-5 w-5' />
                    <span className='text-sm capitalize'>{collaboration.ideaDetails.stage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Voting Section */}
            <div className='flex flex-col items-center gap-3 ml-8'>
              <div className='flex items-center gap-3 bg-white/10 rounded-full p-2 backdrop-blur-sm'>
                <button
                  onClick={() => onVote('up')}
                  disabled={isVoting}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    userVote === 'up'
                      ? 'bg-green-500 text-white shadow-lg scale-110'
                      : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                  } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label='Upvote'
                >
                  <ThumbsUp className='h-5 w-5' />
                </button>
                <div className='text-center px-2'>
                  <div className='text-2xl font-bold'>{votes.upvotes}</div>
                  <div className='text-xs text-blue-200'>upvotes</div>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button className='p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200'>
                  <Heart className='h-5 w-5' />
                </button>
                <button className='p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200'>
                  <Share2 className='h-5 w-5' />
                </button>
              </div>

              {voteError && (
                <span className='text-xs text-red-200 text-center max-w-24'>{voteError}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className='px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <ProtectedAction
              onAction={onExpressInterest}
              buttonClassName='bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              actionName='express interest in this initiative'
            >
              <Handshake className='h-5 w-5' />
              Express Interest
            </ProtectedAction>

            {openRequests.length > 0 && (
              <div className='flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full border border-amber-200'>
                <UserPlus className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  {openRequests.length} Open Position{openRequests.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1 text-slate-600'>
              <Eye className='h-4 w-4' />
              <span className='text-sm'>42 views</span>
            </div>
            <div className='flex items-center gap-1 text-slate-600'>
              <Users className='h-4 w-4' />
              <span className='text-sm'>
                {collaboration.participants?.length || 0} participants
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
