import { InnovatorType } from './constants/roles';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  organization: string;
  type: 'government' | 'corporate' | 'individual';
  status: 'open' | 'in-progress' | 'completed';
  deadline?: string;
  reward?: string;
  eligibilityCriteria?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: InnovatorType | 'admin';
  organization: string;
  position?: string;
  bio?: string;
  profilePicture?: string;
  isVerified: boolean;
  isActive: boolean;
  allowMessages?: boolean;
  createdAt: Date;
  updatedAt: Date;
  location?: string;
  website?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  expertise?: string[];
}

export interface CollaborationRequest {
  id: string;
  role: string;
  expertise: string[];
  description: string;
  status: 'open' | 'filled';
}

export interface InterestSubmission {
  name: string;
  email: string;
  organization: string;
  message: string;
  expertise: string[];
  collaboratorType?: InnovatorType;
  foundingYear?: string;
  researchArea?: string;
  investmentFocus?: string;
  expertiseText?: string;
}

export interface ChallengeDetails {
  deadline: string;
  reward: string;
  eligibilityCriteria: string;
}

export interface PartnershipDetails {
  duration: string;
  resources: string;
  expectedOutcomes: string;
}

export interface IdeaDetails {
  category: string;
  stage: 'concept' | 'prototype' | 'validated' | 'scaling';
  targetAudience: string;
  potentialImpact: string;
  resourcesNeeded?: string;
  creatorName?: string;
  creatorEmail?: string;
}

// New interface for Project collaboration type
export interface ProjectDetails {
  timeline: string;
  budget: string;
  milestones: string[];
  deliverables: string[];
  responsibleParties?: string[];
}

// New interface for Investment collaboration type
export interface InvestmentDetails {
  amount: string;
  equity: string;
  investmentStage: string;
  returnExpectations: string;
  dueDate?: string;
  investmentTerms?: string;
}

// New interface for Mentorship collaboration type
export interface MentorshipDetails {
  duration: string;
  frequency: string;
  areas: string[];
  expectations: string;
  mentorQualifications?: string;
  menteeRequirements?: string;
}

// New interface for Research collaboration type
export interface ResearchDetails {
  researchArea: string;
  methodology: string;
  expectedFindings: string;
  researchTeam: string[];
  fundingSource?: string;
  publicationTarget?: string;
}

// New interface for other collaboration types
export interface OtherTypeDetails {
  specificType: string;
  duration?: string;
  customFields: Record<string, any>;
}

export interface CollaborationTypeDetails {
  challengeDetails?: ChallengeDetails;
  partnershipDetails?: PartnershipDetails;
  ideaDetails?: IdeaDetails;
  projectDetails?: ProjectDetails;
  investmentDetails?: InvestmentDetails;
  mentorshipDetails?: MentorshipDetails;
  researchDetails?: ResearchDetails;
  otherTypeDetails?: OtherTypeDetails;
}

export type CollaborationType = 
  'challenge' | 
  'partnership' | 
  'idea' | 
  'project' | 
  'investment' | 
  'mentorship' | 
  'research' | 
  'employment' | 
  'event' | 
  'support' | 
  'program' | 
  'opportunity' | 
  'grant' | 
  'incubation' | 
  'alliance' | 
  'initiative' | 
  'other';

export interface Collaboration {
  id: string;
  title: string;
  participants: string[];
  status: 'proposed' | 'active' | 'completed';
  challengeId?: string;
  description: string;
  collaborationRequests?: CollaborationRequest[];
  type?: CollaborationType;
  // Legacy specific details fields
  challengeDetails?: ChallengeDetails;
  partnershipDetails?: PartnershipDetails;
  ideaDetails?: IdeaDetails;
  // New unified type-specific details field
  typeSpecificDetails?: CollaborationTypeDetails;
  // Fields for advanced features
  parentCollaborationId?: string;
  teamMembers?: string[];
  visibility?: 'public' | 'private' | 'limited';
  tags?: string[];
  coverImage?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  upvotes?: number;
  downvotes?: number;
  files?: CollaborationFile[];
}

export interface InnovatorBase {
  id: string;
  name: string;
  organization: string;
  type: InnovatorType;
  expertise: string[];
  description: string;
  profileImage?: string;
  tags: string[];
  email?: string;
  location?: string;
  website?: string;
  position?: string;
  allowMessages?: boolean;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface StartupInnovator extends InnovatorBase {
  type: 'startup';
  foundedYear?: string;
  teamSize?: string;
  fundingStage?: string;
  fundingAmount?: string;
  revenue?: string;
  productStage?: string;
  patents?: string[];
  metrics?: Record<string, any>;
}

export interface InvestorInnovator extends InnovatorBase {
  type: 'investor';
  investmentStage?: string[];
  ticketSize?: string;
  portfolioSize?: string;
  sectors?: string[];
  investmentCriteria?: string;
  successfulExits?: number;
  geographicFocus?: string[];
}

export interface ResearchInnovator extends InnovatorBase {
  type: 'research';
  institution?: string;
  department?: string;
  researchAreas?: string[];
  publications?: string[];
  grants?: string[];
  labSize?: string;
}

export interface IndividualInnovator extends InnovatorBase {
  type: 'individual';
  skills?: string[];
  experience?: any[];
  education?: any[];
  certifications?: string[];
}

export interface AcceleratorInnovator extends InnovatorBase {
  type: 'accelerator';
  foundedYear?: string;
  portfolioSize?: string;
  focusAreas?: string[];
  successfulStartups?: number;
  programDuration?: string;
  investmentAmount?: string;
  mentorNetwork?: string[];
}

export interface IncubatorInnovator extends InnovatorBase {
  type: 'incubator';
  foundedYear?: string;
  portfolioSize?: string;
  focusAreas?: string[];
  successfulStartups?: number;
  programDuration?: string;
  facilities?: string[];
  mentorNetwork?: string[];
}

export type Innovator = StartupInnovator | InvestorInnovator | ResearchInnovator | IndividualInnovator | AcceleratorInnovator | IncubatorInnovator;

export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  requester?: User;
  receiver?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  userId: string;
  user: User;
  latestMessage: Message;
  unreadCount: number;
}

export interface CollaborationFile {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

// Helper function to convert User to Innovator format for frontend
export const userToInnovator = (user: User): Innovator => {
  const baseInnovator: InnovatorBase = {
    id: user.id,
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.email.split('@')[0], // Fallback to username part of email if name not available
    organization: user.organization || '',
    type: user.role as InnovatorType,
    expertise: user.expertise || [], // Use dedicated expertise field if available
    description: user.bio || '', // Use bio for description
    profileImage: user.profilePicture,
    email: user.email,
    tags: [],
    location: user.location,
    website: user.website,
    position: user.position,
    allowMessages: user.allowMessages !== undefined ? user.allowMessages : true, // Default to true if not specified
    social: user.social,
  };

  // Add type-specific fields based on the user's role
  switch (user.role) {
    case 'startup':
      return {
        ...baseInnovator,
        type: 'startup',
      } as StartupInnovator;
    case 'investor':
      return {
        ...baseInnovator,
        type: 'investor',
      } as InvestorInnovator;
    case 'research':
      return {
        ...baseInnovator,
        type: 'research',
      } as ResearchInnovator;
    case 'accelerator':
      return {
        ...baseInnovator,
        type: 'accelerator',
      } as AcceleratorInnovator;
    case 'incubator':
      return {
        ...baseInnovator,
        type: 'incubator',
      } as IncubatorInnovator;
    default:
      return {
        ...baseInnovator,
        type: 'individual',
      } as IndividualInnovator;
  }
};

// Helper function to convert Challenge to Collaboration format for frontend
export const challengeToCollaboration = (challenge: Challenge): Collaboration => {
  console.log('Converting challenge to collaboration:', challenge);
  
  return {
    id: challenge.id,
    title: challenge.title,
    participants: [challenge.organization],
    status: challenge.status === 'open' ? 'proposed' : 
            challenge.status === 'in-progress' ? 'active' : 'completed',
    description: challenge.description,
    type: 'challenge',
    challengeDetails: {
      deadline: challenge.deadline || '',
      reward: challenge.reward || '',
      eligibilityCriteria: challenge.eligibilityCriteria || '',
    },
    createdById: challenge.createdById,
    createdAt: challenge.createdAt,
    updatedAt: challenge.updatedAt,
  };
};