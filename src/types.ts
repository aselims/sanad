export interface Challenge {
  id: string;
  title: string;
  description: string;
  organization: string;
  type: 'government' | 'corporate' | 'individual';
  status: 'open' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  organization: string;
  type: 'startup' | 'research' | 'corporate' | 'government' | 'investor' | 'individual';
  expertise: string[];
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
  collaboratorType?: 'startup' | 'research' | 'corporate' | 'government' | 'investor' | 'individual';
  foundingYear?: string;
  researchArea?: string;
  investmentFocus?: string;
  expertiseText?: string;
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
}

export interface Innovator {
  id: string;
  name: string;
  organization: string;
  type: 'startup' | 'research' | 'corporate' | 'government' | 'investor' | 'individual';
  expertise: string[];
  description: string;
  profileImage?: string;
  tags: string[];
}