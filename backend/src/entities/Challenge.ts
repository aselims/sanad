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

  @Column({ nullable: true, name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
