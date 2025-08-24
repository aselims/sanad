import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum IdeaStage {
  CONCEPT = 'concept',
  PROTOTYPE = 'prototype',
  VALIDATED = 'validated',
  SCALING = 'scaling',
}

export enum IdeaStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision',
}

@Entity('ideas')
export class Idea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', array: true })
  participants: string[];

  @Column({
    type: 'enum',
    enum: IdeaStatus,
    default: IdeaStatus.DRAFT,
  })
  status: IdeaStatus;

  @Column()
  category: string;

  @Column({
    type: 'enum',
    enum: IdeaStage,
    default: IdeaStage.CONCEPT,
  })
  stage: IdeaStage;

  @Column({ name: 'target_audience' })
  targetAudience: string;

  @Column({ name: 'potential_impact' })
  potentialImpact: string;

  @Column({ name: 'resources_needed', type: 'text', nullable: true })
  resourcesNeeded: string;

  // Business-focused fields as per PRD
  @Column({ name: 'business_model', type: 'text', nullable: true })
  businessModel: string;

  @Column({ name: 'target_market', type: 'text', nullable: true })
  targetMarket: string;

  @Column({ name: 'competitive_advantage', type: 'text', nullable: true })
  competitiveAdvantage: string;

  @Column({ name: 'funding_needed', type: 'decimal', precision: 15, scale: 2, nullable: true })
  fundingNeeded: number;

  @Column({ name: 'timeline', type: 'text', nullable: true })
  timeline: string;

  @Column('simple-array', { name: 'risk_factors', nullable: true })
  riskFactors: string[];

  @Column('simple-array', { name: 'success_metrics', nullable: true })
  successMetrics: string[];

  @Column('simple-array', { nullable: true })
  attachments: string[];

  @Column({ name: 'submission_completed', default: false })
  submissionCompleted: boolean;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  // Approval workflow fields
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
    name: 'approval_status'
  })
  approvalStatus: ApprovalStatus;

  @Column({ name: 'approved_by_id', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'admin_feedback', type: 'text', nullable: true })
  adminFeedback: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
