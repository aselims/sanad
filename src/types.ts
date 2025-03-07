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
  createdAt: Date;
  updatedAt: Date;
  location?: string;
  website?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
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

export interface Collaboration {
  id: string;
  title: string;
  participants: string[];
  status: 'proposed' | 'active' | 'completed';
  challengeId?: string;
  description: string;
  collaborationRequests?: CollaborationRequest[];
  type?: 'challenge' | 'partnership';
  challengeDetails?: ChallengeDetails;
  partnershipDetails?: PartnershipDetails;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
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

export type Innovator = StartupInnovator | InvestorInnovator | ResearchInnovator | IndividualInnovator;

// Helper function to convert User to Innovator format for frontend
export const userToInnovator = (user: User): Innovator => {
  const baseInnovator: InnovatorBase = {
    id: user.id,
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.email.split('@')[0], // Fallback to username part of email if name not available
    organization: user.organization || '',
    type: user.role as InnovatorType,
    expertise: user.bio?.split(',').map(item => item.trim()) || [],
    description: user.bio || '',
    profileImage: user.profilePicture,
    email: user.email,
    tags: [],
    location: user.location,
    website: user.website,
    position: user.position,
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