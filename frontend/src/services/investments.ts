import api from './api';
import type { Investor } from './investors';
import type { Project } from './projects';

export interface Investment {
  id: string;
  investorId: string;
  projectId: string;
  status: InvestmentStatus;
  investmentType: InvestmentType;
  amount: number;
  currency: string;
  valuation?: number;
  equityPercentage?: number;
  initialInterestDate?: Date;
  dueDiligenceStartDate?: Date;
  termSheetDate?: Date;
  closingDate?: Date;
  expectedClosingDate?: Date;
  leadSource?: string;
  introductionById?: string;
  firstMeetingDate?: Date;
  lastContactDate?: Date;
  interestRate?: number;
  conversionCap?: number;
  discountRate?: number;
  boardSeat: boolean;
  liquidationPreference?: string;
  specialRights: string[];
  dueDiligenceItems?: DueDiligenceItem[];
  dueDiligenceCompleted: boolean;
  dueDiligenceCompletionDate?: Date;
  documents: string[];
  requiredDocuments: string[];
  notes?: string;
  meetingHistory?: MeetingRecord[];
  platformFeePercentage: number;
  platformFeeAmount: number;
  successFeePercentage: number;
  rejectionReason?: string;
  rejectionDate?: Date;
  withdrawalReason?: string;
  withdrawalDate?: Date;
  postMoneyValuation?: number;
  currentValuation?: number;
  exitValuation?: number;
  exitDate?: Date;
  exitType?: string;
  createdAt: Date;
  updatedAt: Date;
  investor: Investor;
  project: Project;
  introductionBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export enum InvestmentStatus {
  INTERESTED = 'interested',
  REVIEWING = 'reviewing',
  DUE_DILIGENCE = 'due_diligence',
  TERM_SHEET = 'term_sheet',
  NEGOTIATION = 'negotiation',
  CLOSED = 'closed',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum InvestmentType {
  EQUITY = 'equity',
  CONVERTIBLE_NOTE = 'convertible_note',
  SAFE = 'safe',
  DEBT = 'debt',
  REVENUE_SHARE = 'revenue_share',
}

export interface DueDiligenceItem {
  item: string;
  status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
  notes?: string;
  completedDate?: Date;
}

export interface MeetingRecord {
  date: Date;
  type: 'pitch' | 'follow_up' | 'due_diligence' | 'negotiation';
  attendees: string[];
  notes: string;
  outcome: string;
}

export interface InvestmentFilters {
  status?: InvestmentStatus;
  investorId?: string;
  projectId?: string;
  investmentType?: InvestmentType;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface CreateInvestmentData {
  investorId: string;
  investmentType: InvestmentType;
  amount: number;
  currency?: string;
  notes?: string;
}

export interface UpdateInvestmentData {
  status?: InvestmentStatus;
  amount?: number;
  valuation?: number;
  equityPercentage?: number;
  expectedClosingDate?: Date;
  interestRate?: number;
  conversionCap?: number;
  discountRate?: number;
  boardSeat?: boolean;
  liquidationPreference?: string;
  specialRights?: string[];
  dueDiligenceItems?: DueDiligenceItem[];
  dueDiligenceCompleted?: boolean;
  documents?: string[];
  requiredDocuments?: string[];
  notes?: string;
  rejectionReason?: string;
  withdrawalReason?: string;
  postMoneyValuation?: number;
  currentValuation?: number;
  exitValuation?: number;
  exitType?: string;
}

export interface InvestmentPipelineStats {
  statusDistribution: Array<{
    status: InvestmentStatus;
    count: number;
    totalAmount: number;
    averageAmount: number;
  }>;
  monthlyTrends: Array<{
    month: Date;
    newInvestments: number;
    closedInvestments: number;
    totalAmount: number;
  }>;
  typeDistribution: Array<{
    type: InvestmentType;
    count: number;
    totalAmount: number;
  }>;
  performance: {
    totalInvestments: number;
    closedInvestments: number;
    failedInvestments: number;
    conversionRate: number;
    averageTimeToClose: number;
    totalAmount: number;
    closedAmount: number;
  };
}

// Express interest in a project
export const expressInterest = async (
  projectId: string, 
  data: CreateInvestmentData
): Promise<Investment> => {
  const response = await api.post(`/investments/interest/${projectId}`, data);
  return response.data.data;
};

// Get all investments with filtering
export const getInvestments = async (filters?: InvestmentFilters): Promise<{
  investments: Investment[];
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
        if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }

  const response = await api.get(`/investments?${params.toString()}`);
  return response.data.data;
};

// Get investment by ID
export const getInvestment = async (id: string): Promise<Investment> => {
  const response = await api.get(`/investments/${id}`);
  return response.data.data;
};

// Update investment
export const updateInvestment = async (
  id: string, 
  data: UpdateInvestmentData
): Promise<Investment> => {
  const response = await api.put(`/investments/${id}`, data);
  return response.data.data;
};

// Add meeting record
export const addMeetingRecord = async (
  id: string,
  meeting: Omit<MeetingRecord, 'date'> & { date: string | Date }
): Promise<Investment> => {
  const response = await api.post(`/investments/${id}/meetings`, meeting);
  return response.data.data;
};

// Get investment pipeline statistics
export const getInvestmentPipelineStats = async (): Promise<InvestmentPipelineStats> => {
  const response = await api.get('/investments/pipeline/stats');
  return response.data.data;
};

// Helper functions
export const getInvestmentStatusDisplay = (status: InvestmentStatus): string => {
  const statusMap = {
    [InvestmentStatus.INTERESTED]: 'Interested',
    [InvestmentStatus.REVIEWING]: 'Reviewing',
    [InvestmentStatus.DUE_DILIGENCE]: 'Due Diligence',
    [InvestmentStatus.TERM_SHEET]: 'Term Sheet',
    [InvestmentStatus.NEGOTIATION]: 'Negotiation',
    [InvestmentStatus.CLOSED]: 'Closed',
    [InvestmentStatus.REJECTED]: 'Rejected',
    [InvestmentStatus.WITHDRAWN]: 'Withdrawn',
  };
  return statusMap[status] || status;
};

export const getInvestmentTypeDisplay = (type: InvestmentType): string => {
  const typeMap = {
    [InvestmentType.EQUITY]: 'Equity',
    [InvestmentType.CONVERTIBLE_NOTE]: 'Convertible Note',
    [InvestmentType.SAFE]: 'SAFE',
    [InvestmentType.DEBT]: 'Debt',
    [InvestmentType.REVENUE_SHARE]: 'Revenue Share',
  };
  return typeMap[type] || type;
};

export const getInvestmentStatusColor = (status: InvestmentStatus): string => {
  const colorMap = {
    [InvestmentStatus.INTERESTED]: 'blue',
    [InvestmentStatus.REVIEWING]: 'yellow',
    [InvestmentStatus.DUE_DILIGENCE]: 'purple',
    [InvestmentStatus.TERM_SHEET]: 'indigo',
    [InvestmentStatus.NEGOTIATION]: 'orange',
    [InvestmentStatus.CLOSED]: 'green',
    [InvestmentStatus.REJECTED]: 'red',
    [InvestmentStatus.WITHDRAWN]: 'gray',
  };
  return colorMap[status] || 'gray';
};

export const calculateROI = (investment: Investment): number | null => {
  if (!investment.currentValuation || !investment.amount || !investment.equityPercentage) {
    return null;
  }
  const currentValue = (investment.currentValuation * investment.equityPercentage) / 100;
  return ((currentValue - investment.amount) / investment.amount) * 100;
};

export const formatAmount = (amount: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

export const getDaysInCurrentStatus = (investment: Investment): number => {
  const now = new Date();
  const updatedAt = new Date(investment.updatedAt);
  return Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
};

export const isActiveInvestment = (investment: Investment): boolean => {
  return ![
    InvestmentStatus.CLOSED,
    InvestmentStatus.REJECTED,
    InvestmentStatus.WITHDRAWN
  ].includes(investment.status);
};