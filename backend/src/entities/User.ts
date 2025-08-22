import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSkill } from './UserSkill';
import { TeamInvitation } from './TeamInvitation';

// Define the UserRole enum with string literals
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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INDIVIDUAL,
  })
  role: UserRole;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ nullable: true })
  organization: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  location: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  allowMessages: boolean;

  @Column({ default: true })
  allowConnections: boolean;

  // Venture-specific fields
  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  availabilityStatus: AvailabilityStatus;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ nullable: true, length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: WorkType,
    default: WorkType.FULLTIME,
  })
  preferredWorkType: WorkType;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.MID,
  })
  experienceLevel: ExperienceLevel;

  // Profile completion tracking
  @Column({ type: 'int', default: 0 })
  profileCompletionPercentage: number;

  @Column({ default: false })
  profileCompleted: boolean;

  @Column({ nullable: true })
  profileCompletedAt: Date;

  // Social and professional links
  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  websiteUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  // Work preferences
  @Column('json', { nullable: true })
  languages: {
    language: string;
    fluency: 'basic' | 'intermediate' | 'advanced' | 'native';
  }[];

  @Column({ nullable: true, length: 50 })
  timeZone: string;

  @Column('json', { nullable: true })
  workingHours: {
    start: string; // '09:00'
    end: string;   // '17:00'
    days: string[]; // ['monday', 'tuesday', ...]
    flexible: boolean;
  };

  // Team and collaboration preferences
  @Column({ default: true })
  lookingForCofounder: boolean;

  @Column({ default: true })
  lookingForTeamMembers: boolean;

  @Column({ default: true })
  openToMentoring: boolean;

  @Column({ default: true })
  seekingMentor: boolean;

  @Column('simple-array', { nullable: true })
  preferredIndustries: string[];

  @Column('simple-array', { nullable: true })
  preferredCompanyStages: string[]; // ['pre_seed', 'seed', 'series_a', ...]

  // Verification and trust
  @Column({ default: 0 })
  verificationLevel: number; // 0-100

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string; // Admin user ID

  @Column('json', { nullable: true })
  achievements: {
    title: string;
    description: string;
    date: Date;
    issuer?: string;
  }[];

  // Platform engagement
  @Column({ type: 'int', default: 0 })
  connectionsCount: number;

  @Column({ type: 'int', default: 0 })
  endorsementsReceived: number;

  @Column({ type: 'int', default: 0 })
  endorsementsGiven: number;

  @Column({ nullable: true })
  lastActiveAt: Date;

  // Relationships
  @OneToMany(() => UserSkill, (skill) => skill.user)
  skills: UserSkill[];

  @OneToMany(() => TeamInvitation, (invitation) => invitation.fromUser)
  sentInvitations: TeamInvitation[];

  @OneToMany(() => TeamInvitation, (invitation) => invitation.toUser)
  receivedInvitations: TeamInvitation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
