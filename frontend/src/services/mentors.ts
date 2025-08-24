import api from './api';

export interface Mentor {
  id: string;
  userId: string;
  status: 'active' | 'busy' | 'inactive' | 'suspended';
  companyName?: string;
  jobTitle?: string;
  yearsOfExperience: number;
  expertiseLevel: 'senior' | 'expert' | 'specialist' | 'thought_leader';
  industryFocus: string[];
  functionalExpertise: string[];
  stagePreference: string[];
  maxMentees: number;
  currentMentees: number;
  hoursPerWeek?: number;
  sessionDurationMinutes: number;
  isPaidMentoring: boolean;
  hourlyRate?: number;
  availableDays: string[];
  timezone: string;
  availableTimeSlots: string[];
  totalSessions: number;
  averageRating?: number;
  totalReviews: number;
  responseTimeHours: number;
  bio?: string;
  mentoringPhilosophy?: string;
  successStories?: string[];
  linkedinUrl?: string;
  websiteUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
  sessions?: MentorSession[];
}

export interface MentorSession {
  id: string;
  mentorId: string;
  menteeId: string;
  projectId?: string;
  type: 'initial_consultation' | 'strategy_session' | 'technical_review' | 'business_review' | 'pitch_practice' | 'problem_solving' | 'career_guidance';
  status: 'requested' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduledAt: string;
  durationMinutes: number;
  startedAt?: string;
  endedAt?: string;
  description: string;
  objectives?: string[];
  preparationNotes?: string;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  sessionNotes?: string;
  actionItems?: string[];
  resourcesShared?: string[];
  menteeRating?: number;
  menteeFeedback?: string;
  mentorRating?: number;
  mentorFeedback?: string;
  isPaid: boolean;
  amount?: number;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  mentor?: Mentor;
  mentee?: any;
  project?: any;
}

export interface CreateMentorProfileRequest {
  companyName?: string;
  jobTitle?: string;
  yearsOfExperience: number;
  expertiseLevel?: Mentor['expertiseLevel'];
  industryFocus: string[];
  functionalExpertise: string[];
  stagePreference: string[];
  maxMentees?: number;
  hoursPerWeek?: number;
  sessionDurationMinutes?: number;
  isPaidMentoring?: boolean;
  hourlyRate?: number;
  availableDays: string[];
  timezone?: string;
  availableTimeSlots: string[];
  bio?: string;
  mentoringPhilosophy?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export interface RequestSessionRequest {
  projectId?: string;
  type?: MentorSession['type'];
  scheduledAt: string;
  durationMinutes?: number;
  description: string;
  objectives?: string[];
}

export interface SearchMentorsParams {
  industryFocus?: string[];
  functionalExpertise?: string[];
  stagePreference?: string[];
  expertiseLevel?: string;
  isPaidMentoring?: boolean;
  maxHourlyRate?: number;
  availableDays?: string[];
  timezone?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface MentorStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  currentMentees: number;
  maxMentees: number;
  averageRating?: number;
  totalReviews: number;
  sessionTypes: Record<string, number>;
  responseTimeHours: number;
}

// Mentor profile management
export const createMentorProfile = async (profileData: CreateMentorProfileRequest): Promise<Mentor> => {
  const response = await api.post('/mentors/profile', profileData);
  return response.data.data;
};

export const updateMentorProfile = async (mentorId: string, updateData: Partial<CreateMentorProfileRequest>): Promise<Mentor> => {
  const response = await api.put(`/mentors/profile/${mentorId}`, updateData);
  return response.data.data;
};

export const getMentorProfile = async (mentorId: string): Promise<Mentor> => {
  const response = await api.get(`/mentors/profile/${mentorId}`);
  return response.data.data;
};

export const getMentorStats = async (mentorId: string): Promise<MentorStats> => {
  const response = await api.get(`/mentors/profile/${mentorId}/stats`);
  return response.data.data;
};

// Mentor search and discovery
export const searchMentors = async (params: SearchMentorsParams): Promise<{ mentors: Mentor[]; pagination: any }> => {
  const response = await api.get('/mentors/search', { params });
  return response.data.data;
};

// Mentoring session management
export const requestSession = async (mentorId: string, sessionData: RequestSessionRequest): Promise<MentorSession> => {
  const response = await api.post(`/mentors/${mentorId}/request-session`, sessionData);
  return response.data.data;
};

export const respondToSessionRequest = async (sessionId: string, accept: boolean, rejectionReason?: string): Promise<MentorSession> => {
  const response = await api.post(`/mentors/sessions/${sessionId}/respond`, { accept, rejectionReason });
  return response.data.data;
};

export const updateSession = async (sessionId: string, updateData: Partial<MentorSession>): Promise<MentorSession> => {
  const response = await api.put(`/mentors/sessions/${sessionId}`, updateData);
  return response.data.data;
};

export const rateSession = async (sessionId: string, rating: number, feedback?: string, role: 'mentor' | 'mentee' = 'mentee'): Promise<MentorSession> => {
  const response = await api.post(`/mentors/sessions/${sessionId}/rate`, { rating, feedback, role });
  return response.data.data;
};

// User's mentoring sessions
export const getUserSessions = async (params?: {
  role?: 'mentor' | 'mentee';
  status?: string;
  upcoming?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ sessions: MentorSession[]; pagination: any }> => {
  const response = await api.get('/mentors/sessions/my-sessions', { params });
  return response.data.data;
};