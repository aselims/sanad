import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { ProjectDocument, DocumentType, DocumentStatus, AccessLevel } from '../entities/ProjectDocument';
import { Project } from '../entities/Project';
import { User } from '../entities/User';

export class ProjectDocumentController {
  private documentRepository: Repository<ProjectDocument>;
  private projectRepository: Repository<Project>;
  private userRepository: Repository<User>;

  constructor() {
    this.documentRepository = AppDataSource.getRepository(ProjectDocument);
    this.projectRepository = AppDataSource.getRepository(Project);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getAllDocuments(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const documents = await this.documentRepository
        .createQueryBuilder('document')
        .leftJoinAndSelect('document.project', 'project')
        .where('project.founderId = :userId OR project.teamLeadId = :userId', { userId })
        .orderBy('document.createdAt', 'DESC')
        .getMany();
      res.json({ message: 'Documents retrieved successfully', documents, count: documents.length });
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  }

  async createDocument(req: Request, res: Response): Promise<void> {
    try {
      const {
        projectId,
        title,
        description,
        type,
        accessLevel,
        fileName,
        filePath,
        fileSize,
        mimeType,
        fileHash,
        parentDocumentId,
        tags,
        milestoneId,
        dueDate,
        expiryDate,
        sharedWith,
        externalLink,
        isConfidential
      } = req.body;

      // Verify project exists and user has access
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['founder', 'teamLead']
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const userId = req.user?.id;
      if (!userId || (project.founderId !== userId && project.teamLeadId !== userId && !project.coreTeamMembers?.includes(userId))) {
        res.status(403).json({ error: 'Insufficient permissions to create project document' });
        return;
      }

      // Validate parent document if provided
      if (parentDocumentId) {
        const parentDoc = await this.documentRepository.findOne({ 
          where: { id: parentDocumentId, projectId }
        });
        if (!parentDoc) {
          res.status(400).json({ error: 'Parent document not found or not in same project' });
          return;
        }
      }

      const document = new ProjectDocument();
      document.projectId = projectId;
      document.title = title;
      document.description = description;
      document.type = type;
      document.accessLevel = accessLevel || AccessLevel.TEAM;
      document.fileName = fileName;
      document.filePath = filePath;
      document.fileSize = fileSize;
      document.mimeType = mimeType;
      document.fileHash = fileHash;
      document.parentDocumentId = parentDocumentId;
      document.createdById = userId;
      document.tags = tags || [];
      document.milestoneId = milestoneId;
      document.dueDate = dueDate ? new Date(dueDate) : null;
      document.expiryDate = expiryDate ? new Date(expiryDate) : null;
      document.sharedWith = sharedWith || [];
      document.externalLink = externalLink;
      document.isConfidential = isConfidential || false;

      const savedDocument = await this.documentRepository.save(document);

      res.status(201).json({
        message: 'Project document created successfully',
        document: savedDocument
      });
    } catch (error) {
      console.error('Error creating project document:', error);
      res.status(500).json({ error: 'Failed to create project document' });
    }
  }

  async getProjectDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { type, status, accessLevel } = req.query;

      // Verify project exists and user has access
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['founder', 'teamLead']
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const userId = req.user?.id;
      const hasFullAccess = userId && (
        project.founderId === userId || 
        project.teamLeadId === userId || 
        project.coreTeamMembers?.includes(userId)
      );

      if (!hasFullAccess) {
        res.status(403).json({ error: 'Insufficient permissions to view project documents' });
        return;
      }

      const queryBuilder = this.documentRepository
        .createQueryBuilder('document')
        .leftJoinAndSelect('document.createdBy', 'createdBy')
        .leftJoinAndSelect('document.lastModifiedBy', 'lastModifiedBy')
        .leftJoinAndSelect('document.reviewedBy', 'reviewedBy')
        .leftJoinAndSelect('document.approvedBy', 'approvedBy')
        .leftJoinAndSelect('document.parentDocument', 'parentDocument')
        .where('document.projectId = :projectId', { projectId });

      // Apply filters based on user access
      if (!hasFullAccess) {
        queryBuilder.andWhere(
          '(document.accessLevel != :private OR document.createdById = :userId OR :userId = ANY(document.sharedWith))',
          { private: AccessLevel.PRIVATE, userId }
        );
      }

      if (type) {
        queryBuilder.andWhere('document.type = :type', { type });
      }

      if (status) {
        queryBuilder.andWhere('document.status = :status', { status });
      }

      if (accessLevel) {
        queryBuilder.andWhere('document.accessLevel = :accessLevel', { accessLevel });
      }

      queryBuilder.orderBy('document.updatedAt', 'DESC');

      const documents = await queryBuilder.getMany();

      // Calculate document summary
      const documentSummary = {
        totalDocuments: documents.length,
        draftDocuments: documents.filter(d => d.status === DocumentStatus.DRAFT).length,
        approvedDocuments: documents.filter(d => d.status === DocumentStatus.APPROVED).length,
        confidentialDocuments: documents.filter(d => d.isConfidential).length,
        typeBreakdown: this.getTypeBreakdown(documents),
        totalFileSize: documents.reduce((sum, d) => sum + (d.fileSize || 0), 0)
      };

      res.json({
        documents,
        summary: documentSummary
      });
    } catch (error) {
      console.error('Error fetching project documents:', error);
      res.status(500).json({ error: 'Failed to fetch project documents' });
    }
  }

  async updateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const document = await this.documentRepository.findOne({
        where: { id },
        relations: ['project', 'createdBy']
      });

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Verify user has permission to update
      const userId = req.user?.id;
      const project = document.project;
      const canEdit = userId && (
        document.createdById === userId ||
        project.founderId === userId ||
        project.teamLeadId === userId ||
        project.coreTeamMembers?.includes(userId)
      );

      if (!canEdit) {
        res.status(403).json({ error: 'Insufficient permissions to update document' });
        return;
      }

      // Handle version increment for significant changes
      if (updateData.filePath && updateData.filePath !== document.filePath) {
        document.versionNumber += 1;
      }

      // Update document
      Object.assign(document, updateData);
      document.lastModifiedById = userId;

      // Handle date updates
      if (updateData.dueDate) {
        document.dueDate = new Date(updateData.dueDate);
      }
      if (updateData.expiryDate) {
        document.expiryDate = new Date(updateData.expiryDate);
      }

      // Handle review/approval workflow
      if (updateData.status === DocumentStatus.UNDER_REVIEW && !document.reviewedAt) {
        document.reviewedById = userId;
        document.reviewedAt = new Date();
      }

      if (updateData.status === DocumentStatus.APPROVED && !document.approvedAt) {
        document.approvedById = userId;
        document.approvedAt = new Date();
      }

      const savedDocument = await this.documentRepository.save(document);

      res.json({
        message: 'Document updated successfully',
        document: savedDocument
      });
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }

  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await this.documentRepository.findOne({
        where: { id },
        relations: ['project']
      });

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Verify user has permission to delete
      const userId = req.user?.id;
      const project = document.project;
      const canDelete = userId && (
        document.createdById === userId ||
        project.founderId === userId ||
        project.teamLeadId === userId
      );

      if (!canDelete) {
        res.status(403).json({ error: 'Insufficient permissions to delete document' });
        return;
      }

      await this.documentRepository.remove(document);

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  async getDocumentVersions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await this.documentRepository.findOne({
        where: { id },
        relations: ['project']
      });

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check access
      const userId = req.user?.id;
      const project = document.project;
      const hasAccess = userId && (
        project.founderId === userId ||
        project.teamLeadId === userId ||
        project.coreTeamMembers?.includes(userId) ||
        document.sharedWith?.includes(userId) ||
        (document.accessLevel !== AccessLevel.PRIVATE && document.createdById === userId)
      );

      if (!hasAccess) {
        res.status(403).json({ error: 'Insufficient permissions to view document versions' });
        return;
      }

      // Get all versions (documents with same parent or this as parent)
      let rootDocumentId = document.parentDocumentId || document.id;

      const versions = await this.documentRepository.find({
        where: [
          { id: rootDocumentId },
          { parentDocumentId: rootDocumentId }
        ],
        relations: ['createdBy', 'lastModifiedBy'],
        order: { versionNumber: 'ASC' }
      });

      res.json({ versions });
    } catch (error) {
      console.error('Error fetching document versions:', error);
      res.status(500).json({ error: 'Failed to fetch document versions' });
    }
  }

  async trackDocumentAccess(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'view' or 'download'

      const document = await this.documentRepository.findOne({ where: { id } });

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Update access statistics
      if (action === 'view') {
        document.viewCount += 1;
      } else if (action === 'download') {
        document.downloadCount += 1;
      }

      document.lastAccessed = new Date();

      await this.documentRepository.save(document);

      res.json({ message: 'Document access tracked successfully' });
    } catch (error) {
      console.error('Error tracking document access:', error);
      res.status(500).json({ error: 'Failed to track document access' });
    }
  }

  async getDocumentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;

      // Verify project access
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['founder', 'teamLead']
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const userId = req.user?.id;
      const hasAccess = userId && (
        project.founderId === userId ||
        project.teamLeadId === userId ||
        project.coreTeamMembers?.includes(userId)
      );

      if (!hasAccess) {
        res.status(403).json({ error: 'Insufficient permissions to view document analytics' });
        return;
      }

      // Document activity over time
      const documentActivity = await this.documentRepository
        .createQueryBuilder('document')
        .select('DATE_TRUNC(\'month\', document.createdAt)', 'month')
        .addSelect('COUNT(*)', 'created')
        .addSelect('SUM(document.viewCount)', 'totalViews')
        .addSelect('SUM(document.downloadCount)', 'totalDownloads')
        .where('document.projectId = :projectId', { projectId })
        .andWhere('document.createdAt >= NOW() - INTERVAL \'12 months\'')
        .groupBy('DATE_TRUNC(\'month\', document.createdAt)')
        .orderBy('month', 'ASC')
        .getRawMany();

      // Most accessed documents
      const mostAccessedDocs = await this.documentRepository.find({
        where: { projectId },
        relations: ['createdBy'],
        order: { viewCount: 'DESC' },
        take: 10
      });

      // Status distribution
      const statusDistribution = await this.documentRepository
        .createQueryBuilder('document')
        .select('document.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('document.projectId = :projectId', { projectId })
        .groupBy('document.status')
        .getRawMany();

      // Storage analytics
      const storageStats = await this.documentRepository
        .createQueryBuilder('document')
        .select('document.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(document.fileSize)', 'totalSize')
        .addSelect('AVG(document.fileSize)', 'avgSize')
        .where('document.projectId = :projectId', { projectId })
        .groupBy('document.type')
        .getRawMany();

      res.json({
        documentActivity,
        mostAccessedDocs: mostAccessedDocs.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          viewCount: doc.viewCount,
          downloadCount: doc.downloadCount,
          createdBy: doc.createdBy?.email,
          lastAccessed: doc.lastAccessed
        })),
        statusDistribution,
        storageStats
      });
    } catch (error) {
      console.error('Error fetching document analytics:', error);
      res.status(500).json({ error: 'Failed to fetch document analytics' });
    }
  }

  // Helper methods
  private getTypeBreakdown(documents: ProjectDocument[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    documents.forEach(doc => {
      breakdown[doc.type] = (breakdown[doc.type] || 0) + 1;
    });
    return breakdown;
  }
}