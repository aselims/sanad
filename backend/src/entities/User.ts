import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ALL_ROLES, INNOVATOR_TYPES, UserRoleType } from '../constants/roles';

// Keep the enum for database compatibility, but use the constants for values
export enum UserRole {
  ADMIN = ALL_ROLES.ADMIN,
  STARTUP = INNOVATOR_TYPES.STARTUP,
  RESEARCH = INNOVATOR_TYPES.RESEARCH,
  CORPORATE = INNOVATOR_TYPES.CORPORATE,
  GOVERNMENT = INNOVATOR_TYPES.GOVERNMENT,
  INVESTOR = INNOVATOR_TYPES.INVESTOR,
  INDIVIDUAL = INNOVATOR_TYPES.INDIVIDUAL,
  INNOVATOR = INNOVATOR_TYPES.INDIVIDUAL, // Legacy support
  ORGANIZATION = INNOVATOR_TYPES.ORGANIZATION,
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INDIVIDUAL,
  })
  role: UserRole;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ nullable: true })
  organization: string;

  @Column({ nullable: true })
  position: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 