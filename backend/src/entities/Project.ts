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
import { Idea } from './Idea';
import { ProjectMilestone } from './ProjectMilestone';

export enum ProjectStatus {
  PLANNING = 'planning',
  DEVELOPMENT = 'development',
  MVP = 'mvp',
  GROWTH = 'growth',
  MATURE = 'mature',
}

export enum ProjectStage {
  PRE_SEED = 'pre_seed',
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'source_idea_id', nullable: true })
  sourceIdeaId: string;

  @ManyToOne(() => Idea, { nullable: true })
  @JoinColumn({ name: 'source_idea_id' })
  sourceIdea: Idea;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectStage,
    default: ProjectStage.PRE_SEED,
  })
  stage: ProjectStage;

  // Core Team
  @Column({ name: 'founder_id' })
  founderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'founder_id' })
  founder: User;

  @Column({ name: 'team_lead_id', nullable: true })
  teamLeadId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'team_lead_id' })
  teamLead: User;

  @Column('simple-array', { name: 'core_team_members', nullable: true })
  coreTeamMembers: string[]; // User IDs

  // Project Scope
  @Column({ name: 'target_launch_date', nullable: true })
  targetLaunchDate: Date;

  @Column({ name: 'estimated_budget', type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedBudget: number;

  @Column({ name: 'funding_goal', type: 'decimal', precision: 15, scale: 2, nullable: true })
  fundingGoal: number;

  // Progress Tracking
  @Column({ name: 'current_milestone', nullable: true })
  currentMilestone: string;

  @Column({ name: 'overall_progress', type: 'int', default: 0 })
  overallProgress: number; // 0-100

  @Column({ name: 'last_status_update' })
  lastStatusUpdate: Date;

  // Business Validation
  @Column({ name: 'has_validated_idea', default: false })
  hasValidatedIdea: boolean;

  @Column({ name: 'has_market_research', default: false })
  hasMarketResearch: boolean;

  @Column({ name: 'has_business_plan', default: false })
  hasBusinessPlan: boolean;

  @Column({ name: 'has_mvp', default: false })
  hasMVP: boolean;

  // Relationships
  @OneToMany(() => ProjectMilestone, (milestone) => milestone.project)
  milestones: ProjectMilestone[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}