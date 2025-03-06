import React, { useState } from 'react';
import { 
  Users, Calendar, ArrowLeft, FileText, 
  MessageSquare, Target, BarChart, Link,
  UserPlus, Briefcase, Award, Handshake,
  Clock, DollarSign
} from 'lucide-react';
import type { Collaboration, CollaborationRequest, InterestSubmission } from '../types';
import { ExpressInterestModal } from './ExpressInterestModal';

type CollaboratorType = 'startup' | 'research' | 'corporate' | 'government' | 'investor' | 'individual';

interface CollaborationDetailsProps {
  collaboration: Collaboration;
  onBack: () => void;
}

function CollaborationRequestCard({ request, onExpressInterest }: { 
  request: CollaborationRequest;
  onExpressInterest: (request: CollaborationRequest) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-yellow-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Briefcase className="h-4 w-4 mr-2" />
          {request.role}
        </h4>
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Open Position
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {request.expertise.map((skill, index) => (
          <span 
            key={index}
            className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 flex items-center gap-1"
          >
            <Award className="h-3 w-3" />
            {skill}
          </span>
        ))}
      </div>
      <button 
        onClick={() => onExpressInterest(request)}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Express Interest
      </button>
    </div>
  );
}

export function CollaborationDetails({ collaboration, onBack }: CollaborationDetailsProps) {
  const openRequests = collaboration.collaborationRequests?.filter(r => r.status === 'open') || [];
  const [selectedRequest, setSelectedRequest] = useState<CollaborationRequest | null>(null);
  const [collaboratorType, setCollaboratorType] = useState<CollaboratorType>('individual');
  const [showInitiativeModal, setShowInitiativeModal] = useState(false);

  const handleExpressInterest = (request: CollaborationRequest) => {
    setSelectedRequest(request);
  };

  const handleSubmitInterest = (submission: InterestSubmission) => {
    // Here you would typically send this to your backend
    console.log('Interest submitted:', submission);
    // Show success message
    alert('Your interest has been submitted successfully! The collaboration team will review your application and contact you soon.');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Workspace
          </button>
          <div className="flex items-center gap-2">
            {openRequests.length > 0 && (
              <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                {openRequests.length} Open Positions
              </span>
            )}
            <span className={`px-3 py-1 text-sm rounded-full ${
              collaboration.status === 'proposed'
                ? 'bg-blue-100 text-blue-800'
                : collaboration.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {collaboration.status}
            </span>
            {collaboration.type && (
              <span className={`px-3 py-1 text-sm rounded-full ${
                collaboration.type === 'challenge'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                {collaboration.type === 'challenge' ? 'Challenge' : 'Partnership'}
              </span>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{collaboration.title}</h1>
        <p className="text-gray-600">{collaboration.description}</p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Left column - Participants & Collaboration Requests */}
        <div className="col-span-1 space-y-6">
          {/* Participants */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Current Participants
            </h2>
            <div className="space-y-3">
              {collaboration.participants.map((participant, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <span className="text-sm text-indigo-600 font-medium">
                      {participant.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{participant}</p>
                    <p className="text-xs text-gray-500">Partner</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Type-specific details */}
          {collaboration.type === 'challenge' && collaboration.challengeDetails && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                Challenge Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Deadline</p>
                    <p className="text-sm text-gray-600">{collaboration.challengeDetails.deadline}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reward</p>
                    <p className="text-sm text-gray-600">{collaboration.challengeDetails.reward}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Eligibility Criteria</p>
                    <p className="text-sm text-gray-600">{collaboration.challengeDetails.eligibilityCriteria}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {collaboration.type === 'partnership' && collaboration.partnershipDetails && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Handshake className="h-5 w-5 mr-2 text-indigo-600" />
                Partnership Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">{collaboration.partnershipDetails.duration}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Resources</p>
                    <p className="text-sm text-gray-600">{collaboration.partnershipDetails.resources}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Target className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Expected Outcomes</p>
                    <p className="text-sm text-gray-600">{collaboration.partnershipDetails.expectedOutcomes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initiative Collaborator Button */}
          <div className="bg-white rounded-lg shadow p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Handshake className="h-4 w-4 mr-2" />
                Initiative Collaborator
              </h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Interested in collaborating on this initiative? Join as a partner to contribute your expertise and resources.
            </p>
            <button 
              onClick={() => setShowInitiativeModal(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <Handshake className="h-4 w-4 mr-2" />
              Express Initiative Interest
            </button>
          </div>

          {/* Open Positions */}
          {openRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Open Positions
              </h2>
              
              {openRequests.map((request, index) => (
                <CollaborationRequestCard 
                  key={index} 
                  request={request}
                  onExpressInterest={handleExpressInterest}
                />
              ))}
            </div>
          )}
        </div>

        {/* Center column - Activity */}
        <div className="col-span-2">
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-gray-500 mb-2">
                  <Target className="h-5 w-5 mr-2" />
                  <span className="text-sm">Milestones</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">3/5</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-gray-500 mb-2">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span className="text-sm">Messages</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-gray-500 mb-2">
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="text-sm">Documents</span>
                </div>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Progress
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

            {/* Related Challenge */}
            {collaboration.challengeId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Link className="h-5 w-5 mr-2" />
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
  );
}