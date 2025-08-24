import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectMilestone } from './ProjectMilestone';
import { User } from './User';

export enum DependencyType {
  FINISH_TO_START = 'finish_to_start',
  START_TO_START = 'start_to_start',
  FINISH_TO_FINISH = 'finish_to_finish',
  START_TO_FINISH = 'start_to_finish',
}

export enum DependencyStatus {
  ACTIVE = 'active',
  SATISFIED = 'satisfied',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}

@Entity('milestone_dependencies')
export class MilestoneDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Predecessor milestone (must be completed first)
  @Column({ name: 'predecessor_milestone_id' })
  predecessorMilestoneId: string;

  @ManyToOne(() => ProjectMilestone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'predecessor_milestone_id' })
  predecessorMilestone: ProjectMilestone;

  // Successor milestone (depends on predecessor)
  @Column({ name: 'successor_milestone_id' })
  successorMilestoneId: string;

  @ManyToOne(() => ProjectMilestone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'successor_milestone_id' })
  successorMilestone: ProjectMilestone;

  @Column({
    type: 'enum',
    enum: DependencyType,
    default: DependencyType.FINISH_TO_START,
  })
  type: DependencyType;

  @Column({
    type: 'enum',
    enum: DependencyStatus,
    default: DependencyStatus.ACTIVE,
  })
  status: DependencyStatus;

  // Lag time (days) - positive for delay, negative for overlap
  @Column({ name: 'lag_days', type: 'int', default: 0 })
  lagDays: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Constraint Details
  @Column({ name: 'is_hard_constraint', default: true })
  isHardConstraint: boolean; // true = must be satisfied, false = soft preference

  @Column({ name: 'criticality_level', type: 'int', default: 3 })
  criticalityLevel: number; // 1-5, 1 being most critical

  // Tracking
  @Column({ name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'satisfied_date', nullable: true })
  satisfiedDate: Date;

  @Column({ name: 'blocked_date', nullable: true })
  blockedDate: Date;

  @Column({ name: 'block_reason', type: 'text', nullable: true })
  blockReason: string;

  // Impact Assessment
  @Column({ name: 'delay_impact_days', type: 'int', nullable: true })
  delayImpactDays: number;

  @Column({ name: 'cost_impact', type: 'decimal', precision: 15, scale: 2, nullable: true })
  costImpact: number;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}