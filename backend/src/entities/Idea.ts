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
  PROPOSED = 'proposed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
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
    default: IdeaStatus.PROPOSED,
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
