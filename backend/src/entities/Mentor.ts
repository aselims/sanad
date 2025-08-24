import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { MentorSession } from './MentorSession';

export enum MentorStatus {
  ACTIVE = 'active',
  BUSY = 'busy',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum ExpertiseLevel {
  SENIOR = 'senior',
  EXPERT = 'expert',
  SPECIALIST = 'specialist',
  THOUGHT_LEADER = 'thought_leader',
}

@Entity('mentors')
export class Mentor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: MentorStatus,
    default: MentorStatus.ACTIVE,
  })
  status: MentorStatus;

  // Professional Information
  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  @Column({ name: 'years_of_experience', type: 'int' })
  yearsOfExperience: number;

  @Column({
    type: 'enum',
    enum: ExpertiseLevel,
    default: ExpertiseLevel.SENIOR,
  })
  expertiseLevel: ExpertiseLevel;

  // Expertise and Focus Areas
  @Column('simple-array', { name: 'industry_focus' })
  industryFocus: string[];

  @Column('simple-array', { name: 'functional_expertise' })
  functionalExpertise: string[];

  @Column('simple-array', { name: 'stage_preference' })
  stagePreference: string[]; // pre-seed, seed, series-a, etc.

  // Mentoring Preferences
  @Column({ name: 'max_mentees', type: 'int', default: 5 })
  maxMentees: number;

  @Column({ name: 'current_mentees', type: 'int', default: 0 })
  currentMentees: number;

  @Column({ name: 'hours_per_week', type: 'int', nullable: true })
  hoursPerWeek: number;

  @Column({ name: 'session_duration_minutes', type: 'int', default: 60 })
  sessionDurationMinutes: number;

  @Column({ name: 'is_paid_mentoring', default: false })
  isPaidMentoring: boolean;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  // Availability and Scheduling
  @Column('simple-array', { name: 'available_days' })
  availableDays: string[]; // monday, tuesday, etc.

  @Column({ name: 'timezone', default: 'UTC' })
  timezone: string;

  @Column('simple-array', { name: 'available_time_slots' })
  availableTimeSlots: string[]; // 09:00-10:00, 14:00-15:00, etc.

  // Performance Metrics
  @Column({ name: 'total_sessions', type: 'int', default: 0 })
  totalSessions: number;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'response_time_hours', type: 'int', default: 24 })
  responseTimeHours: number;

  // Biography and Additional Info
  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'mentoring_philosophy', type: 'text', nullable: true })
  mentoringPhilosophy: string;

  @Column('simple-array', { name: 'success_stories', nullable: true })
  successStories: string[];

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl: string;

  // Verification and Quality Control
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes: string;

  // Relationships
  @OneToMany(() => MentorSession, (session) => session.mentor)
  sessions: MentorSession[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}