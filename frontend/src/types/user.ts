// Enhanced user types for venture studio features

export enum UserRole {
  ADMIN = 'admin',
  STARTUP = 'startup',
  STARTUP_FOUNDER = 'startup_founder',
  RESEARCH = 'research',
  CORPORATE = 'corporate',
  GOVERNMENT = 'government',
  INVESTOR = 'investor',
  INVESTOR_INDIVIDUAL = 'investor_individual',
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization',
  ACCELERATOR = 'accelerator',
  INCUBATOR = 'incubator',
  MENTOR = 'mentor',
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  NOT_AVAILABLE = 'not_available',
}

export enum WorkType {
  FULLTIME = 'fulltime',
  PARTTIME = 'parttime',
  CONTRACT = 'contract',
  EQUITY = 'equity',
  HYBRID = 'hybrid',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  EXPERT = 'expert',
}

export interface Language {
  language: string;
  fluency: 'basic' | 'intermediate' | 'advanced' | 'native';
}

export interface WorkingHours {
  start: string; // '09:00'
  end: string;   // '17:00'
  days: string[]; // ['monday', 'tuesday', ...]
  flexible: boolean;
}

export interface Achievement {
  title: string;
  description: string;
  date: Date;
  issuer?: string;
}

// Extended User interface
export interface User {
  // Basic fields
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  bio?: string;
  organization?: string;
  position?: string;
  location?: string;
  tags?: string[];
  interests?: string[];
  isVerified: boolean;
  isActive: boolean;
  allowMessages: boolean;
  allowConnections: boolean;

  // Venture-specific fields
  availabilityStatus: AvailabilityStatus;
  hourlyRate?: number;
  currency?: string;
  preferredWorkType: WorkType;
  experienceLevel: ExperienceLevel;

  // Profile completion
  profileCompletionPercentage: number;
  profileCompleted: boolean;
  profileCompletedAt?: Date;

  // Social and professional links
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;

  // Work preferences
  languages?: Language[];
  timeZone?: string;
  workingHours?: WorkingHours;

  // Team and collaboration preferences
  lookingForCofounder: boolean;
  lookingForTeamMembers: boolean;
  openToMentoring: boolean;
  seekingMentor: boolean;
  preferredIndustries?: string[];
  preferredCompanyStages?: string[];

  // Verification and trust
  verificationLevel: number;
  verifiedAt?: Date;
  verifiedBy?: string;
  achievements?: Achievement[];

  // Platform engagement
  connectionsCount: number;
  endorsementsReceived: number;
  endorsementsGiven: number;
  lastActiveAt?: Date;

  // Relationships
  skills?: UserSkill[];
  sentInvitations?: TeamInvitation[];
  receivedInvitations?: TeamInvitation[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// UserSkill interface
export interface PortfolioItem {
  title: string;
  description: string;
  url?: string;
  technologies?: string[];
  screenshots?: string[];
}

export interface UserSkill {
  id: string;
  userId: string;
  user?: User;
  skillName: string;
  proficiencyLevel: number; // 1-5
  yearsExperience: number;
  certifications?: string[];
  portfolioItems?: PortfolioItem[];
  endorsedBy: string[];
  isHighlighted: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUpdated: Date;
}

// Team invitation interfaces
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum InvitationType {
  CO_FOUNDER = 'co_founder',
  TEAM_MEMBER = 'team_member',
  ADVISOR = 'advisor',
  MENTOR = 'mentor',
  COLLABORATOR = 'collaborator',
}

export interface TeamInvitation {
  id: string;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  ideaId?: string;
  idea?: any; // Define Idea type separately
  invitationType: InvitationType;
  message: string;
  status: InvitationStatus;
  responseMessage?: string;
  respondedAt?: Date;
  expiresAt: Date;
  additionalData?: {
    proposedRole?: string;
    equityOffered?: number;
    salaryOffered?: number;
    responsibilities?: string[];
    expectations?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// DTOs for API requests
export interface CreateUserSkillDto {
  skillName: string;
  proficiencyLevel: number;
  yearsExperience: number;
  certifications?: string[];
  portfolioItems?: PortfolioItem[];
  isHighlighted?: boolean;
}

export interface UpdateUserSkillDto extends Partial<CreateUserSkillDto> {
  isVisible?: boolean;
}

export interface ProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  organization?: string;
  position?: string;
  location?: string;
  interests?: string[];
  availabilityStatus?: AvailabilityStatus;
  hourlyRate?: number;
  currency?: string;
  preferredWorkType?: WorkType;
  experienceLevel?: ExperienceLevel;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  languages?: Language[];
  timeZone?: string;
  workingHours?: WorkingHours;
  lookingForCofounder?: boolean;
  lookingForTeamMembers?: boolean;
  openToMentoring?: boolean;
  seekingMentor?: boolean;
  preferredIndustries?: string[];
  preferredCompanyStages?: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Utility types
export type UserSkillWithUser = UserSkill & { user: User };
export type UserWithSkills = User & { skills: UserSkill[] };

// Constants for dropdowns and selections
export const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', description: 'Just starting out' },
  { value: 2, label: 'Novice', description: 'Some experience' },
  { value: 3, label: 'Intermediate', description: 'Comfortable with basics' },
  { value: 4, label: 'Advanced', description: 'Highly skilled' },
  { value: 5, label: 'Expert', description: 'Industry expert' },
];

export const AVAILABILITY_STATUS_OPTIONS = [
  { value: AvailabilityStatus.AVAILABLE, label: 'Available', color: 'green' },
  { value: AvailabilityStatus.BUSY, label: 'Busy', color: 'yellow' },
  { value: AvailabilityStatus.NOT_AVAILABLE, label: 'Not Available', color: 'red' },
];

export const WORK_TYPE_OPTIONS = [
  { value: WorkType.FULLTIME, label: 'Full-time' },
  { value: WorkType.PARTTIME, label: 'Part-time' },
  { value: WorkType.CONTRACT, label: 'Contract' },
  { value: WorkType.EQUITY, label: 'Equity only' },
  { value: WorkType.HYBRID, label: 'Hybrid' },
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: ExperienceLevel.ENTRY, label: 'Entry Level' },
  { value: ExperienceLevel.MID, label: 'Mid Level' },
  { value: ExperienceLevel.SENIOR, label: 'Senior' },
  { value: ExperienceLevel.EXPERT, label: 'Expert' },
];

export const COMPANY_STAGES = [
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Growth',
  'Mature',
  'Exit'
];

export const COMMON_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'SaaS',
  'AI/ML',
  'Blockchain',
  'Climate Tech',
  'Biotech',
  'Fintech',
  'Edtech',
  'Healthtech',
  'Proptech',
  'Agtech',
  'Gaming',
  'Media',
  'Manufacturing',
  'Energy',
  'Transportation'
];

export const COMMON_SKILLS = [
  // Technical Skills
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'Rust',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'Machine Learning',
  'Data Science',
  'DevOps',
  'Cybersecurity',
  'Mobile Development',
  'Blockchain',
  
  // Business Skills
  'Product Management',
  'Project Management',
  'Business Development',
  'Sales',
  'Marketing',
  'Digital Marketing',
  'Content Marketing',
  'SEO/SEM',
  'Social Media',
  'Customer Success',
  'Operations',
  'Finance',
  'Accounting',
  'Legal',
  'HR',
  'Strategy',
  'Analytics',
  'UX/UI Design',
  'Graphic Design',
  'Copywriting',
  
  // Leadership Skills
  'Team Leadership',
  'Strategic Planning',
  'Fundraising',
  'Investor Relations',
  'Public Speaking',
  'Negotiation',
  'Mentoring',
  'Coaching',
];
