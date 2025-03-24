import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar, ArrowLeft, FileText, 
  MessageSquare, Target, BarChart, Link as LinkIcon,
  UserPlus, Briefcase, Award, Handshake,
  Clock, DollarSign, AlertCircle, Lightbulb,
  Tag, Zap, ThumbsUp, ThumbsDown, Plus, Check, 
  Calendar as CalendarIcon, Flag, Edit3, Trash2, PlusCircle
} from 'lucide-react';
import type { Collaboration, CollaborationRequest, InterestSubmission } from '../types';
import { ExpressInterestModal } from './ExpressInterestModal';
import ProtectedAction from './auth/ProtectedAction';
import { saveVote, updateCollaborationProgress } from '../services/collaborations';
import { useNavigate, Link } from 'react-router-dom';
import { getUserById } from '../services/users';
import { sendMessage } from '../services/messages';
import { useAuth } from '../contexts/AuthContext';
import CollaborationFiles from './CollaborationFiles';

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
          This feature will be available in Q2 2025
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
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const openRequests = collaboration.collaborationRequests?.filter(r => r.status === 'open') || [];
  const [selectedRequest, setSelectedRequest] = useState<CollaborationRequest | null>(null);
  const [collaboratorType, setCollaboratorType] = useState<CollaboratorType>('individual');
  const [showInitiativeModal, setShowInitiativeModal] = useState(false);
  const [votes, setVotes] = useState({ 
    upvotes: collaboration.upvotes || 0, 
    downvotes: collaboration.downvotes || 0 
  });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [creator, setCreator] = useState<{ name: string; role?: string } | null>(null);
  const [isLoadingCreator, setIsLoadingCreator] = useState(false);
  
  // Check if current user is owner or participant
  const isOwnerOrParticipant = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    
    // Check if user is the owner
    if (collaboration.createdById === user.id) return true;
    
    // Check if user is in participants (participants can be string[] or User[] depending on API)
    if (collaboration.participants && collaboration.participants.length > 0) {
      // If participants are string IDs
      if (typeof collaboration.participants[0] === 'string') {
        if (collaboration.participants.includes(user.id)) return true;
      } 
      // If participants are objects with ids
      else if (typeof collaboration.participants[0] === 'object') {
        // @ts-ignore - Handle potential type mismatch in API response
        if (collaboration.participants.some(p => p && p.id === user.id)) return true;
      }
    }
    
    // Check if user is in team members
    if (collaboration.teamMembers && collaboration.teamMembers.includes(user.id)) return true;
    
    // For testing/development purposes, temporarily allow all users to upload
    // Remove this in production
    // return true;
    
    return false;
  }, [isAuthenticated, user, collaboration]);
  
  // Progress tracking state
  const [progressValue, setProgressValue] = useState(60);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<{id: string; name: string; dueDate: string; completed: boolean}[]>([
    { id: '1', name: 'Project kickoff', dueDate: '2024-06-15', completed: true },
    { id: '2', name: 'First prototype', dueDate: '2024-07-20', completed: false },
    { id: '3', name: 'User testing', dueDate: '2024-08-15', completed: false },
    { id: '4', name: 'Final delivery', dueDate: '2024-09-30', completed: false }
  ]);
  const [newMilestone, setNewMilestone] = useState({ name: '', dueDate: '' });

  // Update votes when collaboration prop changes
  useEffect(() => {
    setVotes({
      upvotes: collaboration.upvotes || 0,
      downvotes: collaboration.downvotes || 0
    });
  }, [collaboration.upvotes, collaboration.downvotes]);

  // Calculate the duration based on start and end dates
  useEffect(() => {
    // Default start date to today if not set
    const start = startDate ? new Date(startDate) : new Date();
    // Default end date to 6 months from now if not set
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  // Add useEffect to fetch creator details
  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (collaboration.createdById) {
        setIsLoadingCreator(true);
        try {
          const userData = await getUserById(collaboration.createdById);
          if (userData) {
            setCreator({
              name: `${userData.firstName} ${userData.lastName}`,
              role: userData.role
            });
          }
        } catch (error) {
          console.error('Error fetching creator details:', error);
        } finally {
          setIsLoadingCreator(false);
        }
      }
    };

    fetchCreatorDetails();
  }, [collaboration.createdById]);

  // Calculate percentage of completed milestones
  const completedMilestones = milestones.filter(milestone => milestone.completed).length;
  const milestonesProgress = milestones.length > 0 
    ? Math.round((completedMilestones / milestones.length) * 100) 
    : 0;

  const handleExpressInterest = (request: CollaborationRequest) => {
    setSelectedRequest(request);
  };

  const handleSubmitInterest = async (submission: InterestSubmission) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        alert('You must be logged in to express interest. Please sign in and try again.');
        return;
      }
      
      // Here you would typically send this to your backend
      console.log('Interest submitted:', submission);
      
      // If there's a createdById in the collaboration, send a message to the owner
      if (collaboration.createdById && user.id !== collaboration.createdById) {
        // Create a message title based on the collaboration type and title
        const messageTitle = `Interest in your ${collaboration.type || 'collaboration'}: ${collaboration.title}`;
        
        // Format any expertise information
        const expertise = submission.expertise && submission.expertise.length > 0 
          ? `Expertise: ${submission.expertise.join(', ')}` 
          : submission.expertiseText 
            ? `Expertise: ${submission.expertiseText}` 
            : '';
        
        // Build the message content from the submission details with improved formatting
        const messageContent = `
✨ ${messageTitle} ✨

Someone has expressed interest in your collaboration!

-------------------------------------------------
📋 CONTACT INFORMATION
-------------------------------------------------
• Name: ${submission.name} 
• Email: ${submission.email}
• Organization: ${submission.organization || 'Not specified'}
• Type: ${submission.collaboratorType || 'Individual'}
${expertise ? `• ${expertise}` : ''}
${submission.foundingYear ? `• Founding Year: ${submission.foundingYear}` : ''}
${submission.researchArea ? `• Research Area: ${submission.researchArea}` : ''}
${submission.investmentFocus ? `• Investment Focus: ${submission.investmentFocus}` : ''}

-------------------------------------------------
💬 MESSAGE FROM INTERESTED PARTY
-------------------------------------------------
${submission.message}

-------------------------------------------------
You can respond directly to this message to contact them.
`;
        
        // Send the message to the collaboration owner
        await sendMessage(collaboration.createdById, messageContent);
      }
      
      // Show success message
      alert('Your interest has been submitted successfully! The collaboration team will review your application and contact you soon.');
    } catch (error) {
      console.error('Error submitting interest:', error);
      alert('There was an error submitting your interest. Please try again later.');
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    // Clear any previous errors
    setVoteError(null);
    setIsVoting(true);
    
    try {
      // Call API first before updating UI
      const response = await saveVote(collaboration.id, voteType);
      
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
      
      // Update with server data if available
      if (response?.upvotes !== undefined && response?.downvotes !== undefined) {
        setVotes({
          upvotes: response.upvotes,
          downvotes: response.downvotes
        });
      }
    } catch (error) {
      console.error('Failed to save vote:', error);
      setVoteError('Unable to record your vote. Please try again.');
      // Don't update UI state if the API call fails
    } finally {
      setIsVoting(false);
    }
  };

  const handleProgressUpdate = async () => {
    try {
      // Show loading state
      setIsSavingProgress(true);
      setProgressError(null);
      
      // Prepare the progress data
      const progressData = {
        progressValue,
        startDate,
        endDate,
        milestones
      };
      
      // Call the service function
      await updateCollaborationProgress(collaboration.id, progressData);
      
      // Update was successful
      setIsEditingProgress(false);
      // You could display a success message here
    } catch (error) {
      console.error('Failed to update progress:', error);
      setProgressError('Failed to save progress. Please try again.');
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.name || !newMilestone.dueDate) return;
    
    const newMilestoneItem = {
      id: Date.now().toString(),
      ...newMilestone,
      completed: false
    };
    
    try {
      setIsSavingMilestone(true);
      setProgressError(null);
      
      // Update local state first for immediate UI response
      const updatedMilestones = [...milestones, newMilestoneItem];
      setMilestones(updatedMilestones);
      
      // Then send to backend
      await updateCollaborationProgress(collaboration.id, {
        progressValue,
        startDate,
        endDate,
        milestones: updatedMilestones
      });
      
      // Clear form and close
      setNewMilestone({ name: '', dueDate: '' });
      setIsAddingMilestone(false);
    } catch (error) {
      console.error('Failed to add milestone:', error);
      setProgressError('Failed to add milestone. Please try again.');
    } finally {
      setIsSavingMilestone(false);
    }
  };

  const handleToggleMilestone = async (id: string) => {
    try {
      setActiveMilestoneId(id);
      setProgressError(null);
      
      // Update local state first for immediate UI response
      const updatedMilestones = milestones.map(m => 
        m.id === id ? { ...m, completed: !m.completed } : m
      );
      setMilestones(updatedMilestones);
      
      // Then send to backend
      await updateCollaborationProgress(collaboration.id, {
        progressValue,
        startDate,
        endDate,
        milestones: updatedMilestones
      });
      
      // Optionally update overall progress based on milestone completion
      if (updatedMilestones.length > 0) {
        const newCompletedCount = updatedMilestones.filter(m => m.completed).length;
        const newProgressValue = Math.round((newCompletedCount / updatedMilestones.length) * 100);
        setProgressValue(newProgressValue);
      }
    } catch (error) {
      console.error('Failed to toggle milestone:', error);
      setProgressError('Failed to update milestone. Please try again.');
      
      // Revert the local state in case of error
      setMilestones(milestones);
    } finally {
      setActiveMilestoneId(null);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      setActiveMilestoneId(id);
      setProgressError(null);
      
      // Update local state first for immediate UI response
      const updatedMilestones = milestones.filter(m => m.id !== id);
      setMilestones(updatedMilestones);
      
      // Then send to backend
      await updateCollaborationProgress(collaboration.id, {
        progressValue,
        startDate,
        endDate,
        milestones: updatedMilestones
      });
      
      // Optionally update overall progress based on milestone completion
      if (updatedMilestones.length > 0) {
        const newCompletedCount = updatedMilestones.filter(m => m.completed).length;
        const newProgressValue = Math.round((newCompletedCount / updatedMilestones.length) * 100);
        setProgressValue(newProgressValue);
      }
    } catch (error) {
      console.error('Failed to delete milestone:', error);
      setProgressError('Failed to delete milestone. Please try again.');
      
      // Revert the local state in case of error
      setMilestones(milestones);
    } finally {
      setActiveMilestoneId(null);
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
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleVote('up')}
                    disabled={isVoting}
                    className={`p-1.5 rounded-full hover:bg-gray-100 ${userVote === 'up' ? 'text-green-600' : 'text-gray-400'} ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Upvote"
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                  <span className="text-gray-700 font-medium">{votes.upvotes}</span>
                  <button 
                    onClick={() => handleVote('down')}
                    disabled={isVoting}
                    className={`p-1.5 rounded-full hover:bg-gray-100 ${userVote === 'down' ? 'text-red-600' : 'text-gray-400'} ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Downvote"
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                  <span className="text-gray-700 font-medium">{votes.downvotes}</span>
                </div>
                {voteError && (
                  <span className="text-xs text-red-500 mt-1">{voteError}</span>
                )}
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
                        {isLoadingCreator ? (
                          <p className="text-sm text-gray-500">Loading...</p>
                        ) : creator ? (
                          <div>
                            <p className="text-sm text-gray-700">{creator.name}</p>
                            {creator.role && (
                              <p className="text-xs text-gray-500 capitalize">{creator.role}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">User #{collaboration.createdById}</p>
                        )}
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
                {collaboration.participants && collaboration.participants.length > 0 ? (
                  <div className="space-y-4">
                    {collaboration.participants.map((participant, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold">
                          {typeof participant === 'string' 
                            ? participant.charAt(0).toUpperCase()
                            : (participant as any)?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {typeof participant === 'string' 
                              ? participant 
                              : (participant as any)?.name || 'Unknown Participant'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {typeof participant !== 'string' && (participant as any)?.role 
                              ? (participant as any).role 
                              : 'Partner'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No participants yet</p>
                )}
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-lg p-5">
                <ComingSoonOverlay title="Progress Tracking Feature">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
                    Progress Tracking
                  </h3>
                  {isAuthenticated && (collaboration.createdById === user?.id || collaboration.participants?.includes(user?.id as any)) && (
                    <button 
                      onClick={() => setIsEditingProgress(!isEditingProgress)}
                      disabled={isSavingProgress}
                      className={`text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center ${isSavingProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      {isEditingProgress ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                </div>
                
                {progressError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                    {progressError}
                  </div>
                )}
                
                {isEditingProgress ? (
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={isSavingProgress}
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={isSavingProgress}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="progressValue" className="block text-sm font-medium text-gray-700 mb-1">Overall Progress: {progressValue}%</label>
                      <input
                        id="progressValue"
                        type="range"
                        min="0"
                        max="100"
                        value={progressValue}
                        onChange={(e) => setProgressValue(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        disabled={isSavingProgress}
                      />
                    </div>
                    <button
                      onClick={handleProgressUpdate}
                      className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center ${isSavingProgress ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={isSavingProgress}
                    >
                      {isSavingProgress ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressValue}%` }} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 text-sm">
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-medium">
                          {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Progress</p>
                        <p className="font-medium">{progressValue}% completed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">End Date</p>
                        <p className="font-medium">
                          {endDate ? new Date(endDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Milestones */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-indigo-600" />
                      Milestones ({completedMilestones}/{milestones.length})
                    </h4>
                    {isAuthenticated && (collaboration.createdById === user?.id || collaboration.participants?.includes(user?.id as any)) && (
                      <button
                        onClick={() => setIsAddingMilestone(!isAddingMilestone)}
                        disabled={isSavingMilestone}
                        className={`text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center ${isSavingMilestone ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        {isAddingMilestone ? 'Cancel' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>

                {isAddingMilestone && (
                  <div className="bg-white p-3 rounded-md shadow-sm mb-3 border border-gray-200">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="Milestone name"
                        value={newMilestone.name}
                        onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isSavingMilestone}
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={newMilestone.dueDate}
                          onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={isSavingMilestone}
                        />
                        <button
                          onClick={handleAddMilestone}
                          disabled={isSavingMilestone || !newMilestone.name || !newMilestone.dueDate}
                          className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center ${(isSavingMilestone || !newMilestone.name || !newMilestone.dueDate) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isSavingMilestone ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {milestones.length > 0 ? (
                    milestones.map(milestone => (
                      <div 
                        key={milestone.id} 
                        className={`bg-white p-3 rounded-md shadow-sm flex items-center justify-between border ${
                          activeMilestoneId === milestone.id 
                            ? 'border-indigo-300 animate-pulse' 
                            : milestone.completed 
                              ? 'border-green-200' 
                              : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => handleToggleMilestone(milestone.id)}
                            disabled={activeMilestoneId === milestone.id}
                            className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center ${
                              milestone.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300'
                            } ${activeMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {milestone.completed && <Check className="h-3 w-3" />}
                            {activeMilestoneId === milestone.id && (
                              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                          </button>
                          <div>
                            <p className={`font-medium text-sm ${milestone.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                              {milestone.name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {isAuthenticated && (collaboration.createdById === user?.id || collaboration.participants?.includes(user?.id as any)) && (
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            disabled={activeMilestoneId === milestone.id}
                            className={`text-gray-400 hover:text-red-500 ${activeMilestoneId === milestone.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {activeMilestoneId === milestone.id ? (
                              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-3">No milestones yet</p>
                  )}
                </div>
                </ComingSoonOverlay>
              </div>

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
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Related Challenge
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Challenge #{collaboration.challengeId}</p>
                      <p className="text-sm text-gray-500">View the original challenge that started this collaboration</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/challenge/${collaboration.challengeId}`)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                      View Challenge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Files Section */}
          <div className="border-t border-gray-200 p-6">
            <CollaborationFiles 
              collaborationId={collaboration.id} 
              isOwnerOrParticipant={isOwnerOrParticipant} 
            />
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