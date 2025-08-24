import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './User';

export enum InvestorType {
  ANGEL = 'angel',
  VC = 'vc',
  CORPORATE = 'corporate',
  FAMILY_OFFICE = 'family_office',
}

export enum StagePreference {
  PRE_SEED = 'pre_seed',
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
  SERIES_C = 'series_c',
  GROWTH = 'growth',
  LATE_STAGE = 'late_stage',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  SAR = 'SAR',
  AED = 'AED',
}

@Entity('investors')
@Index(['investorType', 'isVerified'])
@Index(['minInvestment', 'maxInvestment'])
@Index(['focusAreas'])
export class Investor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship (optional - some investors might not be platform users)
  @Column({ nullable: true, name: 'user_id' })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // Basic Information
  @Column({ name: 'investor_type', type: 'enum', enum: InvestorType })
  investorType: InvestorType;

  @Column({ name: 'firm_name' })
  firmName: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  // Contact Information
  @Column({ name: 'contact_email' })
  contactEmail: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone?: string;

  @Column({ name: 'contact_person', nullable: true })
  contactPerson?: string;

  // Location
  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  timezone?: string;

  // Investment Preferences
  @Column('text', { array: true, name: 'focus_areas', default: '{}' })
  focusAreas: string[];

  @Column('text', { array: true, name: 'stage_preference', default: '{}' })
  stagePreference: string[];

  @Column('text', { array: true, name: 'geographic_focus', default: '{}' })
  geographicFocus: string[];

  @Column({ name: 'min_investment', type: 'decimal', precision: 15, scale: 2 })
  minInvestment: number;

  @Column({ name: 'max_investment', type: 'decimal', precision: 15, scale: 2 })
  maxInvestment: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  currency: Currency;

  // Investment Criteria
  @Column('text', { array: true, name: 'industries', default: '{}' })
  industries: string[];

  @Column('text', { array: true, name: 'business_models', default: '{}' })
  businessModels: string[];

  @Column({ name: 'investment_philosophy', type: 'text', nullable: true })
  investmentPhilosophy?: string;

  // Portfolio Stats
  @Column({ name: 'portfolio_size', default: 0 })
  portfolioSize: number;

  @Column({ name: 'active_investments', default: 0 })
  activeInvestments: number;

  @Column({ 
    name: 'average_ticket_size', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  averageTicketSize: number;

  @Column({ name: 'total_invested', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalInvested: number;

  @Column('text', { array: true, name: 'notable_exits', default: '{}' })
  notableExits: string[];

  // Platform Integration
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verification_date', nullable: true })
  verificationDate?: Date;

  @Column({ name: 'verified_by_id', nullable: true })
  verifiedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by_id' })
  verifiedBy?: User;

  // Platform Activity Stats
  @Column({ name: 'response_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  responseRate: number;

  @Column({ name: 'investments_made', default: 0 })
  investmentsMade: number;

  @Column({ name: 'last_active', nullable: true })
  lastActive?: Date;

  @Column({ name: 'profile_views', default: 0 })
  profileViews: number;

  // Availability & Preferences
  @Column({ name: 'accepting_pitches', default: true })
  acceptingPitches: boolean;

  @Column({ name: 'preferred_contact_method', nullable: true })
  preferredContactMethod?: string;

  @Column('text', { array: true, name: 'availability_hours', default: '{}' })
  availabilityHours: string[];

  @Column({ name: 'time_to_decision_weeks', nullable: true })
  timeToDecisionWeeks?: number;

  // Due Diligence Requirements
  @Column('text', { array: true, name: 'required_documents', default: '{}' })
  requiredDocuments: string[];

  @Column({ name: 'investment_committee', default: false })
  investmentCommittee: boolean;

  @Column({ name: 'board_seat_required', default: false })
  boardSeatRequired: boolean;

  // Status and Notes
  @Column({ default: true })
  active: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'internal_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  internalRating?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields for computed properties
  getAverageResponseTime(): string {
    // This would be calculated based on historical data
    return `${this.responseRate > 80 ? 'Fast' : this.responseRate > 50 ? 'Medium' : 'Slow'} responder`;
  }

  getInvestmentRange(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(this.minInvestment)} - ${formatter.format(this.maxInvestment)}`;
  }

  isActiveInvestor(): boolean {
    return this.active && this.acceptingPitches && this.isVerified;
  }
}