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

export enum UpdateType {
  STATUS_UPDATE = 'status_update',
  MILESTONE_PROGRESS = 'milestone_progress',
  HEALTH_CHECK = 'health_check',
  RISK_ALERT = 'risk_alert',
  BUDGET_UPDATE = 'budget_update',
  TEAM_UPDATE = 'team_update',
  GENERAL = 'general',
}

export enum ProjectHealth {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  AT_RISK = 'at_risk',
  CRITICAL = 'critical',
}

@Entity('project_updates')
export class ProjectUpdate {
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
  content: string;

  @Column({
    type: 'enum',
    enum: UpdateType,
  })
  type: UpdateType;

  // Health Monitoring
  @Column({
    type: 'enum',
    enum: ProjectHealth,
    nullable: true,
  })
  healthStatus: ProjectHealth;

  @Column({ name: 'overall_progress_percentage', type: 'int', nullable: true })
  overallProgressPercentage: number; // 0-100

  @Column({ name: 'schedule_variance_days', type: 'int', nullable: true })
  scheduleVarianceDays: number; // Positive = ahead, Negative = behind

  @Column({ name: 'budget_variance_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  budgetVariancePercentage: number; // Positive = over budget, Negative = under budget

  // Key Metrics
  @Column({ name: 'milestones_completed', type: 'int', nullable: true })
  milestonesCompleted: number;

  @Column({ name: 'milestones_total', type: 'int', nullable: true })
  milestonesTotal: number;

  @Column({ name: 'team_velocity', type: 'decimal', precision: 5, scale: 2, nullable: true })
  teamVelocity: number; // Story points per sprint or similar metric

  @Column({ name: 'quality_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  qualityScore: number; // 1.0-10.0

  // Issues and Blockers
  @Column({ name: 'active_blockers', type: 'int', default: 0 })
  activeBlockers: number;

  @Column({ name: 'resolved_issues', type: 'int', default: 0 })
  resolvedIssues: number;

  @Column({ name: 'new_risks_identified', type: 'int', default: 0 })
  newRisksIdentified: number;

  // Financial Tracking
  @Column({ name: 'budget_spent', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetSpent: number;

  @Column({ name: 'budget_remaining', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetRemaining: number;

  @Column({ name: 'projected_budget_at_completion', type: 'decimal', precision: 15, scale: 2, nullable: true })
  projectedBudgetAtCompletion: number;

  // Team Metrics
  @Column({ name: 'team_size', type: 'int', nullable: true })
  teamSize: number;

  @Column({ name: 'team_utilization_percentage', type: 'int', nullable: true })
  teamUtilizationPercentage: number; // 0-100

  @Column({ name: 'team_satisfaction_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  teamSatisfactionScore: number; // 1.0-10.0

  // Timeline Tracking
  @Column({ name: 'projected_completion_date', nullable: true })
  projectedCompletionDate: Date;

  @Column({ name: 'baseline_completion_date', nullable: true })
  baselineCompletionDate: Date;

  // Authorship
  @Column({ name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  // Visibility
  @Column({ name: 'is_milestone_update', default: false })
  isMilestoneUpdate: boolean;

  @Column({ name: 'is_stakeholder_visible', default: true })
  isStakeholderVisible: boolean;

  @Column({ name: 'requires_attention', default: false })
  requiresAttention: boolean;

  // Additional Data
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'json', nullable: true })
  attachments: any[]; // File references, links, etc.

  @Column({ type: 'json', nullable: true })
  metrics: any; // Flexible storage for custom metrics

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}