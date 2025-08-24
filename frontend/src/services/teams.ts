import api from './api';

export interface Team {
  id: string;
  name: string;
  description?: string;
  type: 'core_team' | 'advisory_board' | 'project_team' | 'working_group';
  status: 'forming' | 'active' | 'completed' | 'disbanded';
  teamLeadId: string;
  projectId?: string;
  maxMembers: number;
  currentMembersCount: number;
  requiredSkills?: string[];
  preferredSkills?: string[];
  isOpenForMembers: boolean;
  teamCharter?: string;
  communicationGuidelines?: string;
  equitySplitAgreed: boolean;
  equitySplit?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  teamLead?: any;
  project?: any;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'founder' | 'co_founder' | 'team_lead' | 'developer' | 'designer' | 'marketer' | 'business_analyst' | 'advisor' | 'mentor' | 'contributor';
  status: 'invited' | 'active' | 'inactive' | 'left' | 'removed';
  joinedAt: string;
  leftAt?: string;
  equityPercentage?: number;
  responsibilities?: string[];
  timeCommitmentHours?: number;
  invitedById?: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
  team?: Team;
  invitedBy?: any;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  type?: Team['type'];
  projectId?: string;
  maxMembers?: number;
  requiredSkills?: string[];
  preferredSkills?: string[];
  teamCharter?: string;
  communicationGuidelines?: string;
}

export interface InviteToTeamRequest {
  userId: string;
  role?: TeamMember['role'];
  message?: string;
}

export interface UpdateTeamMemberRequest {
  role?: TeamMember['role'];
  equityPercentage?: number;
  responsibilities?: string[];
  timeCommitmentHours?: number;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  invitedMembers: number;
  maxMembers: number;
  availableSlots: number;
  roleDistribution: Record<string, number>;
  teamStatus: string;
  teamType: string;
}

export interface SearchMembersParams {
  skills?: string[];
  location?: string;
  availability?: string;
  experienceLevel?: string;
  page?: number;
  limit?: number;
}

// Team API functions
export const createTeam = async (teamData: CreateTeamRequest): Promise<Team> => {
  const response = await api.post('/teams', teamData);
  return response.data.data;
};

export const getUserTeams = async (params?: {
  status?: string;
  type?: string;
  role?: string;
  page?: number;
  limit?: number;
}): Promise<{ teams: Team[]; pagination: any }> => {
  const response = await api.get('/teams', { params });
  return response.data.data;
};

export const getTeam = async (teamId: string): Promise<Team> => {
  const response = await api.get(`/teams/${teamId}`);
  return response.data.data;
};

export const getTeamStats = async (teamId: string): Promise<TeamStats> => {
  const response = await api.get(`/teams/${teamId}/stats`);
  return response.data.data;
};

// Team member management
export const inviteToTeam = async (teamId: string, inviteData: InviteToTeamRequest): Promise<TeamMember> => {
  const response = await api.post(`/teams/${teamId}/invite`, inviteData);
  return response.data.data;
};

export const respondToInvitation = async (teamId: string, accept: boolean): Promise<void> => {
  await api.post(`/teams/${teamId}/respond`, { accept });
};

export const updateTeamMember = async (teamId: string, memberId: string, updateData: UpdateTeamMemberRequest): Promise<TeamMember> => {
  const response = await api.put(`/teams/${teamId}/members/${memberId}`, updateData);
  return response.data.data;
};

export const removeTeamMember = async (teamId: string, memberId: string): Promise<void> => {
  await api.delete(`/teams/${teamId}/members/${memberId}`);
};

export const searchPotentialMembers = async (teamId: string, params: SearchMembersParams): Promise<{ users: any[]; pagination: any }> => {
  const response = await api.get(`/teams/${teamId}/search-members`, { params });
  return response.data.data;
};