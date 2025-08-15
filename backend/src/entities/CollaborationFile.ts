import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Collaboration } from './Collaboration';
import { User } from './User';

@Entity('collaboration_files')
export class CollaborationFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column()
  mimeType: string;

  @Column('int')
  size: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @ManyToOne(() => Collaboration, collaboration => collaboration.files)
  @JoinColumn({ name: 'collaborationId' })
  collaboration: Collaboration;

  @Column()
  collaborationId: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
