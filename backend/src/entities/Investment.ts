import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Investor, Currency } from './Investor';
import { Project } from './Project';
import { User } from './User';

export enum InvestmentStatus {
  INTERESTED = 'interested',
  REVIEWING = 'reviewing',
  DUE_DILIGENCE = 'due_diligence',
  TERM_SHEET = 'term_sheet',
  NEGOTIATION = 'negotiation',
  CLOSED = 'closed',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum InvestmentType {
  EQUITY = 'equity',
  CONVERTIBLE_NOTE = 'convertible_note',
  SAFE = 'safe',
  DEBT = 'debt',
  REVENUE_SHARE = 'revenue_share',
}

@Entity('investments')
@Index(['status', 'createdAt'])
@Index(['investorId', 'projectId'])
@Index(['amount', 'currency'])
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relationships
  @Column({ name: 'investor_id' })
  investorId: string;

  @ManyToOne(() => Investor)
  @JoinColumn({ name: 'investor_id' })
  investor: Investor;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  // Investment Details
  @Column({ type: 'enum', enum: InvestmentStatus, default: InvestmentStatus.INTERESTED })
  status: InvestmentStatus;

  @Column({ name: 'investment_type', type: 'enum', enum: InvestmentType })
  investmentType: InvestmentType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  currency: Currency;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  valuation?: number;

  @Column({ name: 'equity_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  equityPercentage?: number;

  // Timeline
  @Column({ name: 'initial_interest_date', nullable: true })
  initialInterestDate?: Date;

  @Column({ name: 'due_diligence_start_date', nullable: true })
  dueDiligenceStartDate?: Date;

  @Column({ name: 'term_sheet_date', nullable: true })
  termSheetDate?: Date;

  @Column({ name: 'closing_date', nullable: true })
  closingDate?: Date;

  @Column({ name: 'expected_closing_date', nullable: true })
  expectedClosingDate?: Date;

  // Communication
  @Column({ name: 'lead_source', nullable: true })
  leadSource?: string; // 'platform', 'referral', 'direct', etc.

  @Column({ name: 'introduction_by_id', nullable: true })
  introductionById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'introduction_by_id' })
  introductionBy?: User;

  @Column({ name: 'first_meeting_date', nullable: true })
  firstMeetingDate?: Date;

  @Column({ name: 'last_contact_date', nullable: true })
  lastContactDate?: Date;

  // Terms and Conditions
  @Column({ name: 'interest_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate?: number; // For debt/convertible notes

  @Column({ name: 'conversion_cap', type: 'decimal', precision: 15, scale: 2, nullable: true })
  conversionCap?: number; // For SAFE/convertible notes

  @Column({ name: 'discount_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountRate?: number; // For SAFE/convertible notes

  @Column({ name: 'board_seat', default: false })
  boardSeat: boolean;

  @Column({ name: 'liquidation_preference', nullable: true })
  liquidationPreference?: string;

  @Column('text', { array: true, name: 'special_rights', default: '{}' })
  specialRights: string[];

  // Due Diligence
  @Column('json', { name: 'due_diligence_items', nullable: true })
  dueDiligenceItems?: {
    item: string;
    status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
    notes?: string;
    completedDate?: Date;
  }[];

  @Column({ name: 'due_diligence_completed', default: false })
  dueDiligenceCompleted: boolean;

  @Column({ name: 'due_diligence_completion_date', nullable: true })
  dueDiligenceCompletionDate?: Date;

  // Documents
  @Column('text', { array: true, name: 'documents', default: '{}' })
  documents: string[]; // URLs to uploaded documents

  @Column('text', { array: true, name: 'required_documents', default: '{}' })
  requiredDocuments: string[];

  // Communication and Notes
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column('json', { name: 'meeting_history', nullable: true })
  meetingHistory?: {
    date: Date;
    type: 'pitch' | 'follow_up' | 'due_diligence' | 'negotiation';
    attendees: string[];
    notes: string;
    outcome: string;
  }[];

  // Platform Metrics
  @Column({ name: 'platform_fee_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  platformFeePercentage: number;

  @Column({ name: 'platform_fee_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  platformFeeAmount: number;

  @Column({ name: 'success_fee_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  successFeePercentage: number;

  // Status Tracking
  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'rejection_date', nullable: true })
  rejectionDate?: Date;

  @Column({ name: 'withdrawal_reason', nullable: true })
  withdrawalReason?: string;

  @Column({ name: 'withdrawal_date', nullable: true })
  withdrawalDate?: Date;

  // Performance Tracking (post-investment)
  @Column({ name: 'post_money_valuation', type: 'decimal', precision: 15, scale: 2, nullable: true })
  postMoneyValuation?: number;

  @Column({ name: 'current_valuation', type: 'decimal', precision: 15, scale: 2, nullable: true })
  currentValuation?: number;

  @Column({ name: 'exit_valuation', type: 'decimal', precision: 15, scale: 2, nullable: true })
  exitValuation?: number;

  @Column({ name: 'exit_date', nullable: true })
  exitDate?: Date;

  @Column({ name: 'exit_type', nullable: true })
  exitType?: string; // 'acquisition', 'ipo', 'merger', etc.

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  getDaysInCurrentStatus(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  getROI(): number | null {
    if (!this.currentValuation || !this.amount) return null;
    const currentValue = (this.currentValuation * (this.equityPercentage || 0)) / 100;
    return ((currentValue - this.amount) / this.amount) * 100;
  }

  isActive(): boolean {
    return ![InvestmentStatus.CLOSED, InvestmentStatus.REJECTED, InvestmentStatus.WITHDRAWN].includes(this.status);
  }

  getFormattedAmount(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(this.amount);
  }
}