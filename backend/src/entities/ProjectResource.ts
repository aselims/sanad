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

export enum ResourceType {
  HUMAN = 'human',
  FINANCIAL = 'financial',
  EQUIPMENT = 'equipment',
  SOFTWARE = 'software',
  SERVICE = 'service',
}

export enum AllocationStatus {
  PLANNED = 'planned',
  ALLOCATED = 'allocated',
  IN_USE = 'in_use',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('project_resources')
export class ProjectResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  type: ResourceType;

  @Column({
    type: 'enum',
    enum: AllocationStatus,
    default: AllocationStatus.PLANNED,
  })
  status: AllocationStatus;

  // Financial Information
  @Column({ name: 'budget_allocated', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAllocated: number;

  @Column({ name: 'budget_used', type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetUsed: number;

  @Column({ name: 'cost_per_unit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPerUnit: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Allocation Details
  @Column({ name: 'quantity_required', type: 'int', default: 1 })
  quantityRequired: number;

  @Column({ name: 'quantity_allocated', type: 'int', default: 0 })
  quantityAllocated: number;

  @Column({ name: 'utilization_percentage', type: 'int', default: 0 })
  utilizationPercentage: number; // 0-100

  // Timeline
  @Column({ name: 'allocation_start_date', nullable: true })
  allocationStartDate: Date;

  @Column({ name: 'allocation_end_date', nullable: true })
  allocationEndDate: Date;

  @Column({ name: 'actual_start_date', nullable: true })
  actualStartDate: Date;

  @Column({ name: 'actual_end_date', nullable: true })
  actualEndDate: Date;

  // Assignment
  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ name: 'supplier_vendor', nullable: true })
  supplierVendor: string;

  // Additional Information
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_critical', default: false })
  isCritical: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}