import api from './api';

export interface Project {
  id: string;
  name: string;
  description: string;
  sourceIdeaId?: string;
  status: 'planning' | 'development' | 'mvp' | 'growth' | 'mature';
  stage: 'pre_seed' | 'seed' | 'series_a' | 'series_b';
  founderId: string;
  teamLeadId?: string;
  coreTeamMembers: string[];
  targetLaunchDate?: string;
  estimatedBudget?: number;
  fundingGoal?: number;
  currentMilestone?: string;
  overallProgress: number;
  lastStatusUpdate: string;
  hasValidatedIdea: boolean;
  hasMarketResearch: boolean;
  hasBusinessPlan: boolean;
  hasMVP: boolean;
  createdAt: string;
  updatedAt: string;
  founder?: any;
  teamLead?: any;
  sourceIdea?: any;
  milestones?: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  assigneeId?: string;
  completedAt?: string;
  blockers?: string[];
  progressPercentage: number;
  priority: number;
  assignee?: any;
  project?: Project;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  sourceIdeaId?: string;
  targetLaunchDate?: string;
  estimatedBudget?: number;
  fundingGoal?: number;
  teamLeadId?: string;
  coreTeamMembers?: string[];
}

export interface CreateMilestoneRequest {
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  assigneeId?: string;
  priority?: number;
  blockers?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: Project['status'];
  stage?: Project['stage'];
  targetLaunchDate?: string;
  estimatedBudget?: number;
  fundingGoal?: number;
  teamLeadId?: string;
  coreTeamMembers?: string[];
  hasValidatedIdea?: boolean;
  hasMarketResearch?: boolean;
  hasBusinessPlan?: boolean;
  hasMVP?: boolean;
}

export interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: ProjectMilestone['status'];
  assigneeId?: string;
  progressPercentage?: number;
  priority?: number;
  blockers?: string[];
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  milestoneCompletionRate: number;
  totalMilestones: number;
  completedMilestones: number;
}

export interface MilestoneStats {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  notStarted: number;
  overdue: number;
  completionRate: number;
}

// Project API functions
export const createProject = async (projectData: CreateProjectRequest): Promise<Project> => {
  const response = await api.post('/projects', projectData);
  return response.data.data.project;
};

export const getUserProjects = async (params?: {
  status?: string;
  stage?: string;
  page?: number;
  limit?: number;
}): Promise<{ projects: Project[]; pagination: any }> => {
  const response = await api.get('/projects', { params });
  return response.data.data;
};

export const getProject = async (projectId: string): Promise<Project> => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data.data;
};

export const updateProject = async (projectId: string, updateData: UpdateProjectRequest): Promise<Project> => {
  const response = await api.put(`/projects/${projectId}`, updateData);
  return response.data.data;
};

export const convertIdeaToProject = async (ideaId: string): Promise<Project> => {
  const response = await api.post(`/projects/convert-idea/${ideaId}`);
  return response.data.data;
};

export const getProjectStats = async (): Promise<ProjectStats> => {
  const response = await api.get('/projects/stats');
  return response.data.data;
};

// Milestone API functions
export const createMilestone = async (milestoneData: CreateMilestoneRequest): Promise<ProjectMilestone> => {
  const response = await api.post(`/projects/${milestoneData.projectId}/milestones`, milestoneData);
  return response.data.data;
};

export const getProjectMilestones = async (
  projectId: string,
  params?: {
    status?: string;
    assigneeId?: string;
    overdue?: boolean;
  }
): Promise<ProjectMilestone[]> => {
  const response = await api.get(`/projects/${projectId}/milestones`, { params });
  return response.data.data;
};

export const getUserMilestones = async (params?: {
  status?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ milestones: ProjectMilestone[]; pagination: any }> => {
  const response = await api.get('/milestones/my-milestones', { params });
  return response.data.data;
};

export const updateMilestone = async (milestoneId: string, updateData: UpdateMilestoneRequest): Promise<ProjectMilestone> => {
  const response = await api.put(`/milestones/${milestoneId}`, updateData);
  return response.data.data;
};

export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  await api.delete(`/milestones/${milestoneId}`);
};

export const getMilestoneStats = async (projectId: string): Promise<MilestoneStats> => {
  const response = await api.get(`/projects/${projectId}/milestones/stats`);
  return response.data.data;
};