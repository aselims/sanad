import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum NotificationType {
  MESSAGE = 'message',
  CONNECTION = 'connection',
  INTEREST = 'interest',
  SYSTEM = 'system'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'json', nullable: true })
  data: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 