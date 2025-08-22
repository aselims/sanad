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
import { Idea } from './Idea';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum InvitationType {
  CO_FOUNDER = 'co_founder',
  TEAM_MEMBER = 'team_member',
  ADVISOR = 'advisor',
  MENTOR = 'mentor',
  COLLABORATOR = 'collaborator',
}

@Entity('team_invitations')
export class TeamInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @Column()
  toUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_user_id' })
  toUser: User;

  @Column({ nullable: true })
  ideaId: string;

  @ManyToOne(() => Idea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idea_id' })
  idea: Idea;

  @Column({
    type: 'enum',
    enum: InvitationType,
    default: InvitationType.TEAM_MEMBER,
  })
  invitationType: InvitationType;

  @Column({ length: 500 })
  message: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ nullable: true, length: 500 })
  responseMessage: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column()
  expiresAt: Date;

  @Column('json', { nullable: true })
  additionalData: {
    proposedRole?: string;
    equityOffered?: number;
    salaryOffered?: number;
    responsibilities?: string[];
    expectations?: string[];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
