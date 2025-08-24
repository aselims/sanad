import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import * as collaborationsService from '../../services/collaborations';
import * as messagesService from '../../services/messages';
import { ExpressInterestModal } from '../ExpressInterestModal';

import { CollaborationDetailsProps, CollaboratorType, CollaborationRequest } from './types';
import { HeroSection } from './HeroSection';
import { DetailsTabs } from './DetailsTabs';
import { MilestonesSection } from './MilestonesSection';
import { ComingSoonOverlay, CollaborationRequestCard } from './HelperComponents';

export function CollaborationDetails({
  collaboration,
  onBack,
  cameFromSearch = false,
}: CollaborationDetailsProps) {
  const { user } = useAuth();
  // const { addNotification } = useNotifications();

  // State management
  const [showInitiativeModal, setShowInitiativeModal] = useState(false);
  const [votes, setVotes] = useState({
    upvotes: collaboration.upvotes || 0,
    downvotes: collaboration.downvotes || 0,
  });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CollaborationRequest | null>(null);
  const [collaboratorType, setCollaboratorType] = useState<CollaboratorType>('individual');
  const [milestones, setMilestones] = useState(collaboration.milestones || []);

  const isOwner = user?.id === collaboration.createdBy;
  const openRequests =
    collaboration.collaborationRequests?.filter(
      (req: CollaborationRequest) => req.status === 'open'
    ) || [];

  // Vote handling
  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      // addNotification('Please sign in to vote', 'error');
      setVoteError('Please sign in to vote');
      return;
    }

    if (userVote === type) {
      // addNotification('You have already voted', 'info');
      setVoteError('You have already voted');
      return;
    }

    setIsVoting(true);
    setVoteError(null);

    try {
      const response = await collaborationsService.saveVote(collaboration.id, type);
      setVotes({
        upvotes: response.upvotes,
        downvotes: response.downvotes,
      });
      setUserVote(type);
      // addNotification('Vote recorded successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to record vote';
      setVoteError(errorMessage);
      // addNotification(errorMessage, 'error');
    } finally {
      setIsVoting(false);
    }
  };

  // Interest submission
  const handleSubmitInterest = async (interestData: any) => {
    try {
      if (selectedRequest) {
        // TODO: Implement expressInterest API endpoint
        await messagesService.sendMessage(
          collaboration.createdBy,
          `Interest in position: ${selectedRequest.role}\n\n${interestData.message}`
        );
        // addNotification('Interest expressed successfully!', 'success');
      } else {
        await messagesService.sendMessage(
          collaboration.createdBy,
          `Interest in collaboration: ${collaboration.title}\n\n${interestData.message}`
        );
        // addNotification('Your interest has been sent to the collaboration owner!', 'success');
      }

      setSelectedRequest(null);
      setShowInitiativeModal(false);
    } catch (error) {
      console.error('Failed to express interest:', error);
      // addNotification('Failed to express interest. Please try again.', 'error');
    }
  };

  // Milestone management
  const handleAddMilestone = async (milestone: any) => {
    try {
      const newMilestone = {
        id: Date.now().toString(),
        ...milestone,
        createdAt: new Date().toISOString(),
      };
      setMilestones([...milestones, newMilestone]);
      // addNotification('Milestone added successfully', 'success');
    } catch (error) {
      // addNotification('Failed to add milestone', 'error');
    }
  };

  const handleUpdateMilestone = async (id: string, updates: any) => {
    try {
      setMilestones(milestones.map((m: any) => (m.id === id ? { ...m, ...updates } : m)));
      // addNotification('Milestone updated successfully', 'success');
    } catch (error) {
      // addNotification('Failed to update milestone', 'error');
    }
  };

  return (
    <>
      <div className='bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Back Button */}
          <button
            onClick={onBack}
            className='flex items-center text-slate-600 hover:text-slate-900 mb-6 group transition-colors duration-200'
          >
            <ArrowLeft className='h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200' />
            {cameFromSearch ? 'Back to Search Results' : 'Back to Workspace'}
          </button>

          {/* Main Content Card */}
          <div className='bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-slate-200'>
            <HeroSection
              collaboration={collaboration}
              votes={votes}
              userVote={userVote}
              isVoting={isVoting}
              voteError={voteError}
              openRequests={openRequests}
              onVote={handleVote}
              onExpressInterest={() => setShowInitiativeModal(true)}
            />

            <DetailsTabs
              collaboration={collaboration}
              openRequests={openRequests}
              onRequestInterest={setSelectedRequest}
            />
          </div>

          {/* Milestones Section */}
          <div className='mb-8'>
            <MilestonesSection
              milestones={milestones}
              isOwner={isOwner}
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
            />
          </div>

          {/* Team Section */}
          <div className='mb-8'>
            <ComingSoonOverlay title='Team Management'>
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>Team Members</h2>
                <p className='text-gray-500'>Team management features coming soon...</p>
              </div>
            </ComingSoonOverlay>
          </div>

          {/* Updates Section */}
          <div className='mb-8'>
            <ComingSoonOverlay title='Project Updates'>
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>Recent Updates</h2>
                <p className='text-gray-500'>Project updates feature coming soon...</p>
              </div>
            </ComingSoonOverlay>
          </div>

          {/* Open Positions Grid */}
          {openRequests.length > 0 && (
            <div className='mb-8'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>Open Positions</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {openRequests.map((request: CollaborationRequest) => (
                  <CollaborationRequestCard
                    key={request.id}
                    request={request}
                    onExpressInterest={setSelectedRequest}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back to Top Button */}
        <div className='fixed bottom-8 right-8 z-50'>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 10l7-7m0 0l7 7m-7-7v18'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Express Interest Modal for Open Positions */}
      {selectedRequest && (
        <ExpressInterestModal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          onSubmit={handleSubmitInterest}
          request={selectedRequest}
          modalType='position'
        />
      )}

      {/* Initiative Collaborator Modal */}
      {showInitiativeModal && (
        <ExpressInterestModal
          isOpen={true}
          onClose={() => setShowInitiativeModal(false)}
          onSubmit={handleSubmitInterest}
          modalType='initiative'
          collaboratorType={collaboratorType}
          onCollaboratorTypeChange={setCollaboratorType}
        />
      )}
    </>
  );
}

export default CollaborationDetails;
