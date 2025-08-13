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

  // Keep backward compatibility - use one of the existing columns as primary creator
  @Column({ nullable: true, name: 'initiator_id' })
  initiatorId: string;

  @Column({ nullable: true, name: 'partner_id' })
  partnerId: string;

  // For backward compatibility, map createdById to initiator_id
  get createdById(): string {
    return this.initiatorId;
  }

  set createdById(value: string) {
    this.initiatorId = value;
  }

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'initiator_id' })
  initiator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'partner_id' })
  partner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 