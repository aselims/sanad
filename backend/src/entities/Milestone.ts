import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Collaboration } from './Collaboration';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ default: false })
  completed: boolean;

  @ManyToOne(() => Collaboration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collaborationId' })
  collaboration: Collaboration;

  @Column()
  collaborationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
