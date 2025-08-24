import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';

export enum RiskCategory {
  TECHNICAL = 'technical',
  MARKET = 'market',
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  REGULATORY = 'regulatory',
  TEAM = 'team',
  STRATEGIC = 'strategic',
}

export enum RiskProbability {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum RiskImpact {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum RiskStatus {
  IDENTIFIED = 'identified',
  UNDER_REVIEW = 'under_review',
  ACTIVE = 'active',
  MITIGATED = 'mitigated',
  OCCURRED = 'occurred',
  CLOSED = 'closed',
}

@Entity('project_risks')
export class ProjectRisk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: RiskCategory,
  })
  category: RiskCategory;

  @Column({
    type: 'enum',
    enum: RiskProbability,
  })
  probability: RiskProbability;

  @Column({
    type: 'enum',
    enum: RiskImpact,
  })
  impact: RiskImpact;

  @Column({
    type: 'enum',
    enum: RiskStatus,
    default: RiskStatus.IDENTIFIED,
  })
  status: RiskStatus;

  // Risk Assessment
  @Column({ name: 'risk_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  riskScore: number; // Calculated: probability × impact (1.0-25.0)

  @Column({ name: 'priority_level', type: 'int', default: 3 })
  priorityLevel: number; // 1-5, 1 being highest priority

  // Mitigation
  @Column({ name: 'mitigation_strategy', type: 'text', nullable: true })
  mitigationStrategy: string;

  @Column({ name: 'contingency_plan', type: 'text', nullable: true })
  contingencyPlan: string;

  @Column({ name: 'mitigation_cost', type: 'decimal', precision: 15, scale: 2, nullable: true })
  mitigationCost: number;

  @Column({ name: 'mitigation_timeline', nullable: true })
  mitigationTimeline: Date;

  // Assignment
  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // Timeline
  @Column({ name: 'identified_date' })
  identifiedDate: Date;

  @Column({ name: 'target_resolution_date', nullable: true })
  targetResolutionDate: Date;

  @Column({ name: 'actual_resolution_date', nullable: true })
  actualResolutionDate: Date;

  @Column({ name: 'last_reviewed_date', nullable: true })
  lastReviewedDate: Date;

  // Impact Details
  @Column({ name: 'potential_delay_days', type: 'int', nullable: true })
  potentialDelayDays: number;

  @Column({ name: 'potential_cost_impact', type: 'decimal', precision: 15, scale: 2, nullable: true })
  potentialCostImpact: number;

  @Column({ name: 'affected_milestones', type: 'simple-array', nullable: true })
  affectedMilestones: string[]; // Milestone IDs

  // Additional Information
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'external_dependencies', type: 'simple-array', nullable: true })
  externalDependencies: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}