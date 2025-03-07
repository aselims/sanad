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

export interface Innovator {
  id: string;
  name: string;
  organization: string;
  type: InnovatorType;
  expertise: string[];
  description: string;
  profileImage?: string;
  tags: string[];
}

// Helper function to convert User to Innovator format for frontend
export const userToInnovator = (user: User): Innovator => {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    organization: user.organization,
    type: user.role as InnovatorType,
    expertise: user.bio?.split(',') || [],
    description: user.bio || '',
    profileImage: user.profilePicture,
    tags: [],
  };
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