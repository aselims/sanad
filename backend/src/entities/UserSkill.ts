import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';

@Entity('user_skills')
export class UserSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  skillName: string;

  @Column({ type: 'int', default: 1 })
  proficiencyLevel: number; // 1-5 scale (1=Beginner, 5=Expert)

  @Column({ type: 'int', default: 0 })
  yearsExperience: number;

  @Column('simple-array', { nullable: true })
  certifications: string[];

  @Column('json', { nullable: true })
  portfolioItems: {
    title: string;
    description: string;
    url?: string;
    technologies?: string[];
    screenshots?: string[];
  }[];

  @Column('simple-array', { nullable: true })
  endorsedBy: string[]; // User IDs who endorsed this skill

  @Column({ default: false })
  isHighlighted: boolean; // Featured skill

  @Column({ default: true })
  isVisible: boolean; // Show in profile

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;
}
