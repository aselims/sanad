import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  targetUserId: string;

  @Column('float')
  matchScore: number;

  @Column('simple-array')
  sharedTags: string[];

  @Column()
  highlight: string;

  @Column({ type: 'enum', enum: ['like', 'dislike', 'pending'], default: 'pending' })
  preference: 'like' | 'dislike' | 'pending';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;
} 