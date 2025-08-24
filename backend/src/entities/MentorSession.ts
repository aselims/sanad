import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mentor } from './Mentor';
import { User } from './User';
import { Project } from './Project';

export enum SessionStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum SessionType {
  INITIAL_CONSULTATION = 'initial_consultation',
  STRATEGY_SESSION = 'strategy_session',
  TECHNICAL_REVIEW = 'technical_review',
  BUSINESS_REVIEW = 'business_review',
  PITCH_PRACTICE = 'pitch_practice',
  PROBLEM_SOLVING = 'problem_solving',
  CAREER_GUIDANCE = 'career_guidance',
}

@Entity('mentor_sessions')
export class MentorSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mentor_id' })
  mentorId: string;

  @ManyToOne(() => Mentor, (mentor) => mentor.sessions)
  @JoinColumn({ name: 'mentor_id' })
  mentor: Mentor;

  @Column({ name: 'mentee_id' })
  menteeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentee_id' })
  mentee: User;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.INITIAL_CONSULTATION,
  })
  type: SessionType;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.REQUESTED,
  })
  status: SessionStatus;

  @Column({ name: 'scheduled_at' })
  scheduledAt: Date;

  @Column({ name: 'duration_minutes', type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  // Session Details
  @Column({ type: 'text' })
  description: string;

  @Column('simple-array', { nullable: true })
  objectives: string[];

  @Column({ name: 'preparation_notes', type: 'text', nullable: true })
  preparationNotes: string;

  // Meeting Information
  @Column({ name: 'meeting_url', nullable: true })
  meetingUrl: string;

  @Column({ name: 'meeting_id', nullable: true })
  meetingId: string;

  @Column({ name: 'meeting_password', nullable: true })
  meetingPassword: string;

  // Post-Session
  @Column({ name: 'session_notes', type: 'text', nullable: true })
  sessionNotes: string;

  @Column('simple-array', { name: 'action_items', nullable: true })
  actionItems: string[];

  @Column('simple-array', { name: 'resources_shared', nullable: true })
  resourcesShared: string[];

  // Feedback and Rating
  @Column({ name: 'mentee_rating', type: 'int', nullable: true })
  menteeRating: number; // 1-5

  @Column({ name: 'mentee_feedback', type: 'text', nullable: true })
  menteeFeedback: string;

  @Column({ name: 'mentor_rating', type: 'int', nullable: true })
  mentorRating: number; // 1-5

  @Column({ name: 'mentor_feedback', type: 'text', nullable: true })
  mentorFeedback: string;

  // Payment Information
  @Column({ name: 'is_paid', default: false })
  isPaid: boolean;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ name: 'payment_status', nullable: true })
  paymentStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}