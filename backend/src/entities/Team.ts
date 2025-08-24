import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './User';
import { Project } from './Project';
import { TeamMember } from './TeamMember';

export enum TeamStatus {
  FORMING = 'forming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DISBANDED = 'disbanded',
}

export enum TeamType {
  CORE_TEAM = 'core_team',
  ADVISORY_BOARD = 'advisory_board',
  PROJECT_TEAM = 'project_team',
  WORKING_GROUP = 'working_group',
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TeamType,
    default: TeamType.PROJECT_TEAM,
  })
  type: TeamType;

  @Column({
    type: 'enum',
    enum: TeamStatus,
    default: TeamStatus.FORMING,
  })
  status: TeamStatus;

  @Column({ name: 'team_lead_id' })
  teamLeadId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'team_lead_id' })
  teamLead: User;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'max_members', type: 'int', default: 10 })
  maxMembers: number;

  @Column({ name: 'current_members_count', type: 'int', default: 1 })
  currentMembersCount: number;

  @Column('simple-array', { name: 'required_skills', nullable: true })
  requiredSkills: string[];

  @Column('simple-array', { name: 'preferred_skills', nullable: true })
  preferredSkills: string[];

  @Column({ name: 'is_open_for_members', default: true })
  isOpenForMembers: boolean;

  // Team agreement and dynamics
  @Column({ name: 'team_charter', type: 'text', nullable: true })
  teamCharter: string;

  @Column({ name: 'communication_guidelines', type: 'text', nullable: true })
  communicationGuidelines: string;

  @Column({ name: 'equity_split_agreed', default: false })
  equitySplitAgreed: boolean;

  @Column('simple-json', { name: 'equity_split', nullable: true })
  equitySplit: Record<string, number>; // userId -> percentage

  // Relationships
  @OneToMany(() => TeamMember, (member) => member.team)
  members: TeamMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}