import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum PartnershipStatus {
  PROPOSED = 'proposed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('partnerships')
export class Partnership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array')
  participants: string[];

  @Column({
    type: 'enum',
    enum: PartnershipStatus,
    default: PartnershipStatus.PROPOSED,
  })
  status: PartnershipStatus;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true, type: 'text' })
  resources: string;

  @Column({ nullable: true, type: 'text' })
  expectedOutcomes: string;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 