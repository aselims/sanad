import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { ProjectUpdate, UpdateType, ProjectHealth } from '../entities/ProjectUpdate';
import { Project } from '../entities/Project';
import { ProjectMilestone } from '../entities/ProjectMilestone';
import { User } from '../entities/User';

export class ProjectUpdateController {
  private updateRepository: Repository<ProjectUpdate>;
  private projectRepository: Repository<Project>;
  private milestoneRepository: Repository<ProjectMilestone>;
  private userRepository: Repository<User>;

  constructor() {
    this.updateRepository = AppDataSource.getRepository(ProjectUpdate);
    this.projectRepository = AppDataSource.getRepository(Project);
    this.milestoneRepository = AppDataSource.getRepository(ProjectMilestone);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUpdate(req: Request, res: Response): Promise<void> {
    try {
      const {
        projectId,
        title,
        content,
        type,
        healthStatus,
        overallProgressPercentage,
        scheduleVarianceDays,
        budgetVariancePercentage,
        milestonesCompleted,
        milestonesTotal,
        teamVelocity,
        qualityScore,
        activeBlockers,
        resolvedIssues,
        newRisksIdentified,
        budgetSpent,
        budgetRemaining,
        projectedBudgetAtCompletion,
        teamSize,
        teamUtilizationPercentage,
        teamSatisfactionScore,
        projectedCompletionDate,
        baselineCompletionDate,
        isMilestoneUpdate,
        isStakeholderVisible,
        requiresAttention,
        tags,
        attachments,
        metrics
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
        res.status(403).json({ error: 'Insufficient permissions to create project update' });
        return;
      }

      const update = new ProjectUpdate();
      update.projectId = projectId;
      update.title = title;
      update.content = content;
      update.type = type;
      update.healthStatus = healthStatus;
      update.overallProgressPercentage = overallProgressPercentage;
      update.scheduleVarianceDays = scheduleVarianceDays;
      update.budgetVariancePercentage = budgetVariancePercentage;
      update.milestonesCompleted = milestonesCompleted;
      update.milestonesTotal = milestonesTotal;
      update.teamVelocity = teamVelocity;
      update.qualityScore = qualityScore;
      update.activeBlockers = activeBlockers || 0;
      update.resolvedIssues = resolvedIssues || 0;
      update.newRisksIdentified = newRisksIdentified || 0;
      update.budgetSpent = budgetSpent;
      update.budgetRemaining = budgetRemaining;
      update.projectedBudgetAtCompletion = projectedBudgetAtCompletion;
      update.teamSize = teamSize;
      update.teamUtilizationPercentage = teamUtilizationPercentage;
      update.teamSatisfactionScore = teamSatisfactionScore;
      update.projectedCompletionDate = projectedCompletionDate ? new Date(projectedCompletionDate) : null;
      update.baselineCompletionDate = baselineCompletionDate ? new Date(baselineCompletionDate) : null;
      update.createdById = userId;
      update.isMilestoneUpdate = isMilestoneUpdate || false;
      update.isStakeholderVisible = isStakeholderVisible ?? true;
      update.requiresAttention = requiresAttention || false;
      update.tags = tags || [];
      update.attachments = attachments || [];
      update.metrics = metrics || {};

      const savedUpdate = await this.updateRepository.save(update);

      // Update project's last status update timestamp
      project.lastStatusUpdate = new Date();
      if (overallProgressPercentage !== undefined) {
        project.overallProgress = overallProgressPercentage;
      }
      await this.projectRepository.save(project);

      res.status(201).json({
        message: 'Project update created successfully',
        update: savedUpdate
      });
    } catch (error) {
      console.error('Error creating project update:', error);
      res.status(500).json({ error: 'Failed to create project update' });
    }
  }

  async getProjectUpdates(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { type, healthStatus, stakeholderVisible, limit = 50, offset = 0 } = req.query;

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
        res.status(403).json({ error: 'Insufficient permissions to view project updates' });
        return;
      }

      const queryBuilder = this.updateRepository
        .createQueryBuilder('update')
        .leftJoinAndSelect('update.createdBy', 'createdBy')
        .where('update.projectId = :projectId', { projectId });

      // Apply filters
      if (type) {
        queryBuilder.andWhere('update.type = :type', { type });
      }

      if (healthStatus) {
        queryBuilder.andWhere('update.healthStatus = :healthStatus', { healthStatus });
      }

      if (stakeholderVisible === 'true') {
        queryBuilder.andWhere('update.isStakeholderVisible = true');
      }

      queryBuilder
        .orderBy('update.createdAt', 'DESC')
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      const updates = await queryBuilder.getMany();

      // Get latest health status
      const latestHealthUpdate = await this.updateRepository.findOne({
        where: { 
          projectId,
          healthStatus: Not(null) as any
        },
        order: { createdAt: 'DESC' }
      });

      res.json({
        updates,
        latestHealthStatus: latestHealthUpdate?.healthStatus,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: await queryBuilder.getCount()
        }
      });
    } catch (error) {
      console.error('Error fetching project updates:', error);
      res.status(500).json({ error: 'Failed to fetch project updates' });
    }
  }

  async updateProjectUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const update = await this.updateRepository.findOne({
        where: { id },
        relations: ['project', 'createdBy']
      });

      if (!update) {
        res.status(404).json({ error: 'Update not found' });
        return;
      }

      // Verify user has permission to update
      const userId = req.user?.id;
      const project = update.project;
      const canEdit = userId && (
        update.createdById === userId ||
        project.founderId === userId ||
        project.teamLeadId === userId ||
        project.coreTeamMembers?.includes(userId)
      );

      if (!canEdit) {
        res.status(403).json({ error: 'Insufficient permissions to update this update' });
        return;
      }

      // Update fields
      Object.assign(update, updateData);

      // Handle date updates
      if (updateData.projectedCompletionDate) {
        update.projectedCompletionDate = new Date(updateData.projectedCompletionDate);
      }
      if (updateData.baselineCompletionDate) {
        update.baselineCompletionDate = new Date(updateData.baselineCompletionDate);
      }

      const savedUpdate = await this.updateRepository.save(update);

      res.json({
        message: 'Update updated successfully',
        update: savedUpdate
      });
    } catch (error) {
      console.error('Error updating project update:', error);
      res.status(500).json({ error: 'Failed to update project update' });
    }
  }

  async deleteUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const update = await this.updateRepository.findOne({
        where: { id },
        relations: ['project']
      });

      if (!update) {
        res.status(404).json({ error: 'Update not found' });
        return;
      }

      // Verify user has permission to delete
      const userId = req.user?.id;
      const project = update.project;
      const canDelete = userId && (
        update.createdById === userId ||
        project.founderId === userId ||
        project.teamLeadId === userId
      );

      if (!canDelete) {
        res.status(403).json({ error: 'Insufficient permissions to delete update' });
        return;
      }

      await this.updateRepository.remove(update);

      res.json({ message: 'Update deleted successfully' });
    } catch (error) {
      console.error('Error deleting update:', error);
      res.status(500).json({ error: 'Failed to delete update' });
    }
  }

  async getProjectHealthMetrics(req: Request, res: Response): Promise<void> {
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
        res.status(403).json({ error: 'Insufficient permissions to view health metrics' });
        return;
      }

      // Get latest health update
      const latestHealthUpdate = await this.updateRepository.findOne({
        where: { 
          projectId,
          healthStatus: Not(null) as any
        },
        order: { createdAt: 'DESC' }
      });

      // Health trend over time
      const healthTrend = await this.updateRepository.find({
        where: { 
          projectId,
          healthStatus: Not(null) as any
        },
        order: { createdAt: 'ASC' },
        take: 20
      });

      // Progress trend
      const progressTrend = await this.updateRepository.find({
        where: { 
          projectId,
          overallProgressPercentage: Not(null) as any
        },
        order: { createdAt: 'ASC' },
        take: 20
      });

      // Budget variance trend
      const budgetTrend = await this.updateRepository.find({
        where: { 
          projectId,
          budgetVariancePercentage: Not(null) as any
        },
        order: { createdAt: 'ASC' },
        take: 20
      });

      // Risk and blocker trends
      const riskTrend = await this.updateRepository
        .createQueryBuilder('update')
        .select('DATE_TRUNC(\'week\', update.createdAt)', 'week')
        .addSelect('AVG(update.activeBlockers)', 'avgBlockers')
        .addSelect('AVG(update.newRisksIdentified)', 'avgNewRisks')
        .addSelect('AVG(update.resolvedIssues)', 'avgResolvedIssues')
        .where('update.projectId = :projectId', { projectId })
        .andWhere('update.createdAt >= NOW() - INTERVAL \'3 months\'')
        .groupBy('DATE_TRUNC(\'week\', update.createdAt)')
        .orderBy('week', 'ASC')
        .getRawMany();

      // Calculate health score based on multiple factors
      const healthScore = this.calculateHealthScore(latestHealthUpdate);

      res.json({
        currentHealth: {
          status: latestHealthUpdate?.healthStatus || ProjectHealth.FAIR,
          score: healthScore,
          lastUpdated: latestHealthUpdate?.createdAt
        },
        trends: {
          health: healthTrend.map(update => ({
            date: update.createdAt,
            status: update.healthStatus,
            requiresAttention: update.requiresAttention
          })),
          progress: progressTrend.map(update => ({
            date: update.createdAt,
            percentage: update.overallProgressPercentage,
            scheduleVariance: update.scheduleVarianceDays
          })),
          budget: budgetTrend.map(update => ({
            date: update.createdAt,
            variance: update.budgetVariancePercentage,
            spent: update.budgetSpent,
            projected: update.projectedBudgetAtCompletion
          })),
          risks: riskTrend
        },
        alerts: await this.getHealthAlerts(projectId)
      });
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      res.status(500).json({ error: 'Failed to fetch health metrics' });
    }
  }

  async getUpdateAnalytics(req: Request, res: Response): Promise<void> {
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
        res.status(403).json({ error: 'Insufficient permissions to view analytics' });
        return;
      }

      // Update frequency
      const updateFrequency = await this.updateRepository
        .createQueryBuilder('update')
        .select('DATE_TRUNC(\'month\', update.createdAt)', 'month')
        .addSelect('COUNT(*)', 'count')
        .addSelect('COUNT(CASE WHEN update.type = \'health_check\' THEN 1 END)', 'healthChecks')
        .addSelect('COUNT(CASE WHEN update.requiresAttention THEN 1 END)', 'attentionRequired')
        .where('update.projectId = :projectId', { projectId })
        .andWhere('update.createdAt >= NOW() - INTERVAL \'12 months\'')
        .groupBy('DATE_TRUNC(\'month\', update.createdAt)')
        .orderBy('month', 'ASC')
        .getRawMany();

      // Update type distribution
      const typeDistribution = await this.updateRepository
        .createQueryBuilder('update')
        .select('update.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('update.projectId = :projectId', { projectId })
        .groupBy('update.type')
        .getRawMany();

      // Team performance metrics
      const teamMetrics = await this.updateRepository
        .createQueryBuilder('update')
        .select('DATE_TRUNC(\'month\', update.createdAt)', 'month')
        .addSelect('AVG(update.teamVelocity)', 'avgVelocity')
        .addSelect('AVG(update.teamUtilizationPercentage)', 'avgUtilization')
        .addSelect('AVG(update.teamSatisfactionScore)', 'avgSatisfaction')
        .addSelect('AVG(update.qualityScore)', 'avgQuality')
        .where('update.projectId = :projectId', { projectId })
        .andWhere('update.createdAt >= NOW() - INTERVAL \'6 months\'')
        .groupBy('DATE_TRUNC(\'month\', update.createdAt)')
        .orderBy('month', 'ASC')
        .getRawMany();

      res.json({
        updateFrequency,
        typeDistribution,
        teamMetrics,
        summary: {
          totalUpdates: await this.updateRepository.count({ where: { projectId } }),
          avgUpdatesPerMonth: updateFrequency.reduce((sum, month) => sum + parseInt(month.count), 0) / Math.max(updateFrequency.length, 1),
          attentionRequiredCount: await this.updateRepository.count({ 
            where: { projectId, requiresAttention: true } 
          })
        }
      });
    } catch (error) {
      console.error('Error fetching update analytics:', error);
      res.status(500).json({ error: 'Failed to fetch update analytics' });
    }
  }

  // Helper methods
  private calculateHealthScore(update: ProjectUpdate | null): number {
    if (!update) return 50; // Default neutral score

    let score = 50; // Base score

    // Health status impact
    switch (update.healthStatus) {
      case ProjectHealth.EXCELLENT:
        score += 30;
        break;
      case ProjectHealth.GOOD:
        score += 15;
        break;
      case ProjectHealth.FAIR:
        break; // No change
      case ProjectHealth.AT_RISK:
        score -= 20;
        break;
      case ProjectHealth.CRITICAL:
        score -= 40;
        break;
    }

    // Schedule variance impact
    if (update.scheduleVarianceDays !== null) {
      if (update.scheduleVarianceDays > 0) {
        score += Math.min(15, update.scheduleVarianceDays * 2); // Ahead of schedule
      } else if (update.scheduleVarianceDays < 0) {
        score -= Math.min(25, Math.abs(update.scheduleVarianceDays) * 2); // Behind schedule
      }
    }

    // Budget variance impact
    if (update.budgetVariancePercentage !== null) {
      score -= Math.max(0, update.budgetVariancePercentage * 0.5); // Over budget is bad
    }

    // Quality and team satisfaction
    if (update.qualityScore !== null) {
      score += (update.qualityScore - 5) * 3; // Scale 1-10, adjust from neutral 5
    }

    if (update.teamSatisfactionScore !== null) {
      score += (update.teamSatisfactionScore - 5) * 2;
    }

    // Active blockers impact
    score -= update.activeBlockers * 5;

    // Resolved issues boost
    score += update.resolvedIssues * 2;

    return Math.max(0, Math.min(100, score));
  }

  private async getHealthAlerts(projectId: string): Promise<any[]> {
    const alerts: any[] = [];

    // Get recent updates that require attention
    const attentionUpdates = await this.updateRepository.find({
      where: { 
        projectId, 
        requiresAttention: true,
        createdAt: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
      take: 10
    });

    attentionUpdates.forEach(update => {
      alerts.push({
        type: 'attention_required',
        message: update.title,
        severity: update.healthStatus === ProjectHealth.CRITICAL ? 'high' : 'medium',
        createdAt: update.createdAt,
        createdBy: update.createdBy?.email
      });
    });

    return alerts;
  }
}

// Import Not from typeorm for the health status query
import { Not, MoreThan } from 'typeorm';