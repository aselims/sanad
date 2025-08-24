import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';

export enum DocumentType {
  BUSINESS_PLAN = 'business_plan',
  TECHNICAL_SPEC = 'technical_spec',
  FINANCIAL_MODEL = 'financial_model',
  MARKET_RESEARCH = 'market_research',
  LEGAL_DOCUMENT = 'legal_document',
  PRESENTATION = 'presentation',
  REPORT = 'report',
  REQUIREMENTS = 'requirements',
  DESIGN = 'design',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  ARCHIVED = 'archived',
}

export enum AccessLevel {
  PRIVATE = 'private',
  TEAM = 'team',
  PROJECT = 'project',
  COMPANY = 'company',
  PUBLIC = 'public',
}

@Entity('project_documents')
export class ProjectDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.TEAM,
  })
  accessLevel: AccessLevel;

  // File Information
  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number; // in bytes

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ name: 'file_hash', nullable: true })
  fileHash: string; // For integrity verification

  // Version Control
  @Column({ name: 'version_number', default: 1 })
  versionNumber: number;

  @Column({ name: 'parent_document_id', nullable: true })
  parentDocumentId: string;

  @ManyToOne(() => ProjectDocument, { nullable: true })
  @JoinColumn({ name: 'parent_document_id' })
  parentDocument: ProjectDocument;

  // Authorship
  @Column({ name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'last_modified_by_id', nullable: true })
  lastModifiedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'last_modified_by_id' })
  lastModifiedBy: User;

  // Review Process
  @Column({ name: 'reviewed_by_id', nullable: true })
  reviewedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'approved_by_id', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  // Metadata
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ name: 'milestone_id', nullable: true })
  milestoneId: string;

  @Column({ name: 'due_date', nullable: true })
  dueDate: Date;

  @Column({ name: 'expiry_date', nullable: true })
  expiryDate: Date;

  // Collaboration
  @Column({ name: 'shared_with', type: 'simple-array', nullable: true })
  sharedWith: string[]; // User IDs

  @Column({ name: 'external_link', nullable: true })
  externalLink: string;

  @Column({ name: 'is_confidential', default: false })
  isConfidential: boolean;

  // Statistics
  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'last_accessed', nullable: true })
  lastAccessed: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}