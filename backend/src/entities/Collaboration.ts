import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum CollaborationType {
  CHALLENGE = 'challenge',
  PARTNERSHIP = 'partnership',
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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @Column({ nullable: true, type: 'jsonb' })
  requirements: object;

  @Column({ nullable: true, type: 'jsonb' })
  resources: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 