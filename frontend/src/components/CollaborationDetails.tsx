import React, { useState } from 'react';
import { 
  Users, Calendar, ArrowLeft, FileText, 
  MessageSquare, Target, BarChart, Link,
  UserPlus, Briefcase, Award, Handshake,
  Clock, DollarSign, AlertCircle, Lightbulb,
  Tag, Zap, ThumbsUp, ThumbsDown
} from 'lucide-react';
import type { Collaboration, CollaborationRequest, InterestSubmission } from '../types';
import { ExpressInterestModal } from './ExpressInterestModal';
import ProtectedAction from './auth/ProtectedAction';
import { saveVote } from '../services/collaborations';

type CollaboratorType = 'startup' | 'research' | 'corporate' | 'government' | 'investor' | 'individual' | 'accelerator' | 'incubator';

interface CollaborationDetailsProps {
  collaboration: Collaboration;
  onBack: () => void;
  cameFromSearch?: boolean;
}

function ComingSoonOverlay({ children, title }: { children: React.ReactNode, title?: string }) {
  const [isTransparent, setIsTransparent] = useState(false);

  const toggleTransparency = () => {
    setIsTransparent(!isTransparent);
  };

  return (
    <div className="relative">
      {children}
      <div 
        onClick={toggleTransparency}
        className={`absolute inset-0 ${isTransparent ? 'bg-gray-100 bg-opacity-30' : 'bg-gray-100 bg-opacity-99'} 
          backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 cursor-pointer`}
      >
        <AlertCircle className={`h-8 w-8 text-indigo-500 mb-2 ${isTransparent ? 'opacity-50' : 'opacity-100'}`} />
        <p className={`text-lg font-medium text-gray-800 ${isTransparent ? 'opacity-50' : 'opacity-100'}`}>
          {title || 'Coming Soon'}
        </p>
        <p className={`text-sm text-gray-600 mt-1 ${isTransparent ? 'opacity-50' : 'opacity-100'}`}>
          This feature will be available in the next version
        </p>
        <p className="text-xs text-indigo-600 mt-3 font-medium">
          {isTransparent ? 'Click to hide details' : 'Click to preview'}
        </p>
      </div>
    </div>
  );
}

function CollaborationRequestCard({ request, onExpressInterest }: { 
  request: CollaborationRequest;
  onExpressInterest: (request: CollaborationRequest) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{request.role}</h4>
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          request.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {request.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {request.expertise.map((skill, index) => (
          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
            {skill}
          </span>
        ))}
      </div>
      <ProtectedAction
        onAction={() => onExpressInterest(request)}
        buttonClassName="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
        actionName="express interest in this position"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Express Interest
      </ProtectedAction>
    </div>
  );
}

export function CollaborationDetails({ collaboration, onBack, cameFromSearch = false }: CollaborationDetailsProps) {
  const openRequests = collaboration.collaborationRequests?.filter(r => r.status === 'open') || [];
  const [selectedRequest, setSelectedRequest] = useState<CollaborationRequest | null>(null);
  const [collaboratorType, setCollaboratorType] = useState<CollaboratorType>('individual');
  const [showInitiativeModal, setShowInitiativeModal] = useState(false);
  const [votes, setVotes] = useState({ 
    upvotes: collaboration.upvotes || 0, 
    downvotes: collaboration.downvotes || 0 
  });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleExpressInterest = (request: CollaborationRequest) => {
    setSelectedRequest(request);
  };

  const handleSubmitInterest = (submission: InterestSubmission) => {
    // Here you would typically send this to your backend
    console.log('Interest submitted:', submission);
    // Show success message
    alert('Your interest has been submitted successfully! The collaboration team will review your application and contact you soon.');
  };

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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {cameFromSearch ? 'Back to Search Results' : 'Back to Workspace'}
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 pb-4">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{collaboration.title}</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVote('up')}
                  className={`p-1.5 rounded-full hover:bg-gray-100 ${userVote === 'up' ? 'text-green-600' : 'text-gray-400'}`}
                  aria-label="Upvote"
                >
                  <ThumbsUp className="h-5 w-5" />
                </button>
                <span className="text-gray-700 font-medium">{votes.upvotes}</span>
                <button 
                  onClick={() => handleVote('down')}
                  className={`p-1.5 rounded-full hover:bg-gray-100 ${userVote === 'down' ? 'text-red-600' : 'text-gray-400'}`}
                  aria-label="Downvote"
                >
                  <ThumbsDown className="h-5 w-5" />
                </button>
                <span className="text-gray-700 font-medium">{votes.downvotes}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-3">{collaboration.description}</p>
            <div className="flex flex-wrap gap-2">
              {collaboration.status && (
                <span className={`px-3 py-1 text-sm rounded-full ${
                  collaboration.status === 'proposed'
                    ? 'bg-blue-100 text-blue-800'
                    : collaboration.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {collaboration.status}
                </span>
              )}
              {collaboration.type && (
                <span className={`px-3 py-1 text-sm rounded-full ${
                  collaboration.type === 'challenge'
                    ? 'bg-purple-100 text-purple-800'
                    : collaboration.type === 'idea'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {collaboration.type === 'challenge' 
                    ? 'Challenge' 
                    : collaboration.type === 'idea'
                    ? 'Idea'
                    : 'Partnership'}
                </span>
              )}
              {openRequests.length > 0 && (
                <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                  <UserPlus className="h-4 w-4 mr-1" />
                  {openRequests.length} Open Position{openRequests.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
            {/* Left column - Details */}
            <div className="space-y-6 md:col-span-1">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-4">
                  {collaboration.createdById && (
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Created by</p>
                        <p className="text-sm text-gray-500">User #{collaboration.createdById}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created on</p>
                      <p className="text-sm text-gray-500">
                        {new Date(collaboration.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {collaboration.type === 'challenge' && collaboration.challengeDetails && (
                    <>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Deadline</p>
                          <p className="text-sm text-gray-500">{collaboration.challengeDetails.deadline}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reward</p>
                          <p className="text-sm text-gray-500">{collaboration.challengeDetails.reward}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Eligibility</p>
                          <p className="text-sm text-gray-500">{collaboration.challengeDetails.eligibilityCriteria}</p>
                        </div>
                      </div>
                    </>
                  )}
                  {collaboration.type === 'partnership' && collaboration.partnershipDetails && (
                    <>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Duration</p>
                          <p className="text-sm text-gray-500">{collaboration.partnershipDetails.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Resources</p>
                          <p className="text-sm text-gray-500">{collaboration.partnershipDetails.resources}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Target className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Expected Outcomes</p>
                          <p className="text-sm text-gray-500">{collaboration.partnershipDetails.expectedOutcomes}</p>
                        </div>
                      </div>
                    </>
                  )}
                  {collaboration.type === 'idea' && collaboration.ideaDetails && (
                    <>
                      <div className="flex items-start">
                        <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Category</p>
                          <p className="text-sm text-gray-500">{collaboration.ideaDetails.category}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Zap className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Stage</p>
                          <p className="text-sm text-gray-500">{collaboration.ideaDetails.stage}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Target Audience</p>
                          <p className="text-sm text-gray-500">{collaboration.ideaDetails.targetAudience}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Award className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Potential Impact</p>
                          <p className="text-sm text-gray-500">{collaboration.ideaDetails.potentialImpact}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Express Interest */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Join This Initiative</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Interested in contributing to this {collaboration.type || 'collaboration'}? 
                  Express your interest directly.
                </p>
                <ProtectedAction
                  onAction={() => setShowInitiativeModal(true)}
                  buttonClassName="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
                  actionName="express interest in this initiative"
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Express Interest
                </ProtectedAction>
              </div>
            </div>

            {/* Center column - Activity */}
            <div className="md:col-span-2 space-y-6">
              {/* Current Participants */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Current Participants
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold">
                    N
                  </div>
                  <div>
                    <p className="font-medium">Numquam magni ullamc</p>
                    <p className="text-sm text-gray-500">Partner</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <ComingSoonOverlay title="Progress Tracking Coming Soon">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
                    Progress Tracking Coming Soon
                  </h3>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">Jan 15, 2025</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">6 months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium">Jul 15, 2025</p>
                    </div>
                  </div>
                </div>
              </ComingSoonOverlay>

              {/* Activity Stats */}
              <ComingSoonOverlay title="Activity Stats Coming Soon">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
                    Activity Stats Coming Soon
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">This feature will be available in the next version</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-2">
                        <Target className="h-5 w-5 mr-2" />
                        <span className="text-sm">Milestones</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">3/5</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-2">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        <span className="text-sm">Messages</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">24</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-2">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="text-sm">Documents</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
              </ComingSoonOverlay>
            </div>

            {/* Right column - Open Positions */}
            <div className="md:col-span-1 space-y-6">
              {openRequests.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-indigo-600" />
                    Open Positions
                  </h3>
                  <div className="space-y-4">
                    {openRequests.map((request, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{request.role}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            request.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {request.expertise.map((skill, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <ProtectedAction
                          onAction={() => handleExpressInterest(request)}
                          buttonClassName="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
                          actionName="express interest in this position"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Express Interest
                        </ProtectedAction>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Challenge */}
              {collaboration.challengeId && (
                <ComingSoonOverlay title="Related Challenges Coming Soon">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Link className="h-5 w-5 mr-2 text-indigo-600" />
                      Related Challenge
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Challenge #{collaboration.challengeId}</p>
                        <p className="text-sm text-gray-500">View the original challenge that started this collaboration</p>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        View Challenge
                      </button>
                    </div>
                  </div>
                </ComingSoonOverlay>
              )}
            </div>
          </div>
        </div>

        {/* Express Interest Modal for Open Positions */}
        {selectedRequest && (
          <ExpressInterestModal
            isOpen={true}
            onClose={() => setSelectedRequest(null)}
            onSubmit={handleSubmitInterest}
            request={selectedRequest}
            modalType="position"
          />
        )}

        {/* Initiative Collaborator Modal */}
        {showInitiativeModal && (
          <ExpressInterestModal
            isOpen={true}
            onClose={() => setShowInitiativeModal(false)}
            onSubmit={handleSubmitInterest}
            modalType="initiative"
            collaboratorType={collaboratorType}
            onCollaboratorTypeChange={setCollaboratorType}
          />
        )}
      </div>
    </div>
  );
}