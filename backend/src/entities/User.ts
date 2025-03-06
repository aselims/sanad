import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  INNOVATOR = 'innovator',
  ORGANIZATION = 'organization',
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
    default: UserRole.INNOVATOR,
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