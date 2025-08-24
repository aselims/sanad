import api from './api';

export interface Investor {
  id: string;
  userId?: string;
  investorType: 'angel' | 'vc' | 'corporate' | 'family_office';
  firmName: string;
  website?: string;
  description?: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  contactPerson?: string;
  country?: string;
  city?: string;
  timezone?: string;
  focusAreas: string[];
  stagePreference: string[];
  geographicFocus: string[];
  minInvestment: number;
  maxInvestment: number;
  currency: string;
  industries: string[];
  businessModels: string[];
  investmentPhilosophy?: string;
  portfolioSize: number;
  activeInvestments: number;
  averageTicketSize: number;
  totalInvested: number;
  notableExits: string[];
  isVerified: boolean;
  verificationDate?: Date;
  responseRate: number;
  investmentsMade: number;
  lastActive?: Date;
  profileViews: number;
  acceptingPitches: boolean;
  preferredContactMethod?: string;
  availabilityHours: string[];
  timeToDecisionWeeks?: number;
  requiredDocuments: string[];
  investmentCommittee: boolean;
  boardSeatRequired: boolean;
  active: boolean;
  notes?: string;
  internalRating?: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  stats?: {
    totalInvestments: number;
    closedInvestments: number;
    averageAmount: number;
    totalAmount: number;
  };
}

export interface InvestorFilters {
  investorType?: string;
  country?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  focusAreas?: string[];
  stagePreference?: string[];
  isVerified?: boolean;
  acceptingPitches?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateInvestorData {
  investorType: string;
  firmName: string;
  website?: string;
  description?: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  contactPerson?: string;
  country?: string;
  city?: string;
  timezone?: string;
  focusAreas?: string[];
  stagePreference?: string[];
  geographicFocus?: string[];
  minInvestment: number;
  maxInvestment: number;
  currency?: string;
  industries?: string[];
  businessModels?: string[];
  investmentPhilosophy?: string;
  portfolioSize?: number;
  activeInvestments?: number;
  averageTicketSize?: number;
  totalInvested?: number;
  notableExits?: string[];
  preferredContactMethod?: string;
  availabilityHours?: string[];
  timeToDecisionWeeks?: number;
  requiredDocuments?: string[];
  investmentCommittee?: boolean;
  boardSeatRequired?: boolean;
  notes?: string;
}

export interface InvestorStats {
  overview: {
    totalInvestors: number;
    verifiedInvestors: number;
    acceptingPitches: number;
    verificationRate: number;
  };
  investments: {
    totalInvestments: number;
    activeInvestors: number;
    totalAmount: number;
    averageAmount: number;
  };
  distribution: {
    byType: Array<{ type: string; count: number }>;
    byCurrency: Array<{ currency: string; count: number }>;
  };
}

export interface InvestorMatchResult {
  project: {
    id: string;
    name: string;
    stage?: string;
    fundingGoal?: number;
  };
  matchingInvestors: Investor[];
  matchingCriteria: {
    fundingRange: string;
    stage: string;
    category: string;
  };
}

// Create investor profile
export const createInvestor = async (data: CreateInvestorData): Promise<Investor> => {
  const response = await api.post('/investors', data);
  return response.data.data;
};

// Get all investors with filtering
export const getInvestors = async (filters?: InvestorFilters): Promise<{
  investors: Investor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }

  const response = await api.get(`/investors?${params.toString()}`);
  return response.data.data;
};

// Get investor by ID
export const getInvestor = async (id: string): Promise<Investor> => {
  const response = await api.get(`/investors/${id}`);
  return response.data.data;
};

// Update investor profile
export const updateInvestor = async (id: string, data: Partial<CreateInvestorData>): Promise<Investor> => {
  const response = await api.put(`/investors/${id}`, data);
  return response.data.data;
};

// Verify investor (admin only)
export const verifyInvestor = async (id: string): Promise<Investor> => {
  const response = await api.post(`/investors/${id}/verify`);
  return response.data.data;
};

// Match investors to project
export const matchInvestorsToProject = async (projectId: string): Promise<InvestorMatchResult> => {
  const response = await api.get(`/investors/match/project/${projectId}`);
  return response.data.data;
};

// Get investor statistics
export const getInvestorStats = async (): Promise<InvestorStats> => {
  const response = await api.get('/investors/stats');
  return response.data.data;
};

// Helper function to format investment range
export const formatInvestmentRange = (investor: Investor): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: investor.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(investor.minInvestment)} - ${formatter.format(investor.maxInvestment)}`;
};

// Helper function to get investor type display name
export const getInvestorTypeDisplay = (type: string): string => {
  const typeMap = {
    angel: 'Angel Investor',
    vc: 'Venture Capital',
    corporate: 'Corporate Venture',
    family_office: 'Family Office'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

// Helper function to get response rate description
export const getResponseRateDescription = (rate: number): string => {
  if (rate >= 80) return 'Fast responder';
  if (rate >= 50) return 'Medium responder';
  return 'Slow responder';
};