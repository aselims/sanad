import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Milestone } from './Milestone';
import { CollaborationFile } from './CollaborationFile';

export enum CollaborationType {
  CHALLENGE = 'challenge',
  PARTNERSHIP = 'partnership',
  IDEA = 'idea',
  PROJECT = 'project',
  INVESTMENT = 'investment',
  MENTORSHIP = 'mentorship',
  RESEARCH = 'research',
  EMPLOYMENT = 'employment',
  EVENT = 'event',
  SUPPORT = 'support',
  PROGRAM = 'program',
  OPPORTUNITY = 'opportunity',
  GRANT = 'grant',
  INCUBATION = 'incubation',
  ALLIANCE = 'alliance',
  INITIATIVE = 'initiative',
  OTHER = 'other'
}

export enum CollaborationStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: CollaborationType,
  })
  type: CollaborationType;

  @Column({
    type: 'enum',
    enum: CollaborationStatus,
    default: CollaborationStatus.DRAFT,
  })
  status: CollaborationStatus;

  @Column({ nullable: true })
  coverImage: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true, type: 'date' })
  startDate: Date;

  @Column({ nullable: true, type: 'date' })
  endDate: Date;

  @Column({ default: 0 })
  progressValue: number;

  @OneToMany(() => Milestone, milestone => milestone.collaboration, { cascade: true })
  milestones: Milestone[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @Column({ nullable: true, type: 'jsonb' })
  requirements: object;

  @Column({ nullable: true, type: 'jsonb' })
  resources: object;

  @Column({ nullable: true, type: 'jsonb' })
  typeSpecificDetails: object;

  @Column({ nullable: true })
  parentCollaborationId: string;

  @Column('simple-array', { nullable: true })
  teamMembers: string[];

  @OneToMany(() => CollaborationFile, file => file.collaboration, { cascade: true })
  files: CollaborationFile[];

  @Column({ default: 'public' })
  visibility: 'public' | 'private' | 'limited';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 