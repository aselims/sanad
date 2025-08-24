import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './Team';
import { User } from './User';

export enum TeamMemberRole {
  FOUNDER = 'founder',
  CO_FOUNDER = 'co_founder',
  TEAM_LEAD = 'team_lead',
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  MARKETER = 'marketer',
  BUSINESS_ANALYST = 'business_analyst',
  ADVISOR = 'advisor',
  MENTOR = 'mentor',
  CONTRIBUTOR = 'contributor',
}

export enum MembershipStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEFT = 'left',
  REMOVED = 'removed',
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: TeamMemberRole,
    default: TeamMemberRole.CONTRIBUTOR,
  })
  role: TeamMemberRole;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @Column({ name: 'joined_at' })
  joinedAt: Date;

  @Column({ name: 'left_at', nullable: true })
  leftAt: Date;

  @Column({ name: 'equity_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  equityPercentage: number;

  @Column('simple-array', { nullable: true })
  responsibilities: string[];

  @Column({ name: 'time_commitment_hours', type: 'int', nullable: true })
  timeCommitmentHours: number; // hours per week

  @Column({ name: 'invited_by_id', nullable: true })
  invitedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by_id' })
  invitedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}