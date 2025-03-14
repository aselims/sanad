import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Define the UserRole enum with string literals
export enum UserRole {
  ADMIN = 'admin',
  STARTUP = 'startup',
  RESEARCH = 'research',
  CORPORATE = 'corporate',
  GOVERNMENT = 'government',
  INVESTOR = 'investor',
  INDIVIDUAL = 'individual',
  INNOVATOR = 'individual', // Legacy support
  ORGANIZATION = 'organization',
  ACCELERATOR = 'accelerator',
  INCUBATOR = 'incubator',
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

  @Column({ nullable: true })
  location: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 