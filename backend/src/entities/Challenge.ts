import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum ChallengeType {
  GOVERNMENT = 'government',
  CORPORATE = 'corporate',
  INDIVIDUAL = 'individual',
}

export enum ChallengeStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  organization: string;

  @Column({
    type: 'enum',
    enum: ChallengeType,
    default: ChallengeType.CORPORATE,
  })
  type: ChallengeType;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.OPEN,
  })
  status: ChallengeStatus;

  @Column({ nullable: true })
  deadline: string;

  @Column({ nullable: true })
  reward: string;

  @Column({ nullable: true, type: 'text' })
  eligibilityCriteria: string;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 