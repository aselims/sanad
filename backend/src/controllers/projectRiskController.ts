import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { ProjectRisk, RiskCategory, RiskProbability, RiskImpact, RiskStatus } from '../entities/ProjectRisk';
import { Project } from '../entities/Project';
import { User } from '../entities/User';

export class ProjectRiskController {
  private projectRiskRepository: Repository<ProjectRisk>;
  private projectRepository: Repository<Project>;
  private userRepository: Repository<User>;

  constructor() {
    this.projectRiskRepository = AppDataSource.getRepository(ProjectRisk);
    this.projectRepository = AppDataSource.getRepository(Project);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createRisk(req: Request, res: Response): Promise<void> {
    try {
      const {
        projectId,
        title,
        description,
        category,
        probability,
        impact,
        mitigationStrategy,
        contingencyPlan,
        mitigationCost,
        mitigationTimeline,
        ownerId,
        targetResolutionDate,
        potentialDelayDays,
        potentialCostImpact,
        affectedMilestones,
        tags,
        notes,
        externalDependencies
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
        res.status(403).json({ error: 'Insufficient permissions to manage project risks' });
        return;
      }

      // Validate owner if provided
      if (ownerId) {
        const owner = await this.userRepository.findOne({ where: { id: ownerId } });
        if (!owner) {
          res.status(400).json({ error: 'Risk owner not found' });
          return;
        }
      }

      const risk = new ProjectRisk();
      risk.projectId = projectId;
      risk.title = title;
      risk.description = description;
      risk.category = category;
      risk.probability = probability;
      risk.impact = impact;
      risk.mitigationStrategy = mitigationStrategy;
      risk.contingencyPlan = contingencyPlan;
      risk.mitigationCost = mitigationCost;
      risk.mitigationTimeline = mitigationTimeline ? new Date(mitigationTimeline) : null;
      risk.ownerId = ownerId;
      risk.identifiedDate = new Date();
      risk.targetResolutionDate = targetResolutionDate ? new Date(targetResolutionDate) : null;
      risk.potentialDelayDays = potentialDelayDays;
      risk.potentialCostImpact = potentialCostImpact;
      risk.affectedMilestones = affectedMilestones || [];
      risk.tags = tags || [];
      risk.notes = notes;
      risk.externalDependencies = externalDependencies || [];

      // Calculate risk score (probability * impact, both on 1-5 scale)
      const probabilityScore = this.getProbabilityScore(probability);
      const impactScore = this.getImpactScore(impact);
      risk.riskScore = probabilityScore * impactScore;
      risk.priorityLevel = this.calculatePriorityLevel(risk.riskScore);

      const savedRisk = await this.projectRiskRepository.save(risk);

      res.status(201).json({
        message: 'Project risk created successfully',
        risk: savedRisk
      });
    } catch (error) {
      console.error('Error creating project risk:', error);
      res.status(500).json({ error: 'Failed to create project risk' });
    }
  }

  async getProjectRisks(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { category, status, priority } = req.query;

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
        res.status(403).json({ error: 'Insufficient permissions to view project risks' });
        return;
      }

      const queryBuilder = this.projectRiskRepository
        .createQueryBuilder('risk')
        .leftJoinAndSelect('risk.owner', 'owner')
        .where('risk.projectId = :projectId', { projectId });

      if (category) {
        queryBuilder.andWhere('risk.category = :category', { category });
      }

      if (status) {
        queryBuilder.andWhere('risk.status = :status', { status });
      }

      if (priority) {
        queryBuilder.andWhere('risk.priorityLevel = :priority', { priority: parseInt(priority as string) });
      }

      queryBuilder.orderBy('risk.riskScore', 'DESC')
                  .addOrderBy('risk.createdAt', 'DESC');

      const risks = await queryBuilder.getMany();

      // Calculate risk summary
      const riskSummary = {
        totalRisks: risks.length,
        activeRisks: risks.filter(r => r.status === RiskStatus.ACTIVE).length,
        highPriorityRisks: risks.filter(r => r.priorityLevel <= 2).length,
        averageRiskScore: risks.length > 0 
          ? risks.reduce((sum, r) => sum + (r.riskScore || 0), 0) / risks.length 
          : 0,
        categoryBreakdown: this.getCategoryBreakdown(risks)
      };

      res.json({
        risks,
        summary: riskSummary
      });
    } catch (error) {
      console.error('Error fetching project risks:', error);
      res.status(500).json({ error: 'Failed to fetch project risks' });
    }
  }

  async updateRisk(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const risk = await this.projectRiskRepository.findOne({
        where: { id },
        relations: ['project', 'owner']
      });

      if (!risk) {
        res.status(404).json({ error: 'Risk not found' });
        return;
      }

      // Verify user has permission to update
      const userId = req.user?.id;
      const project = risk.project;
      if (!userId || (project.founderId !== userId && project.teamLeadId !== userId && risk.ownerId !== userId && !project.coreTeamMembers?.includes(userId))) {
        res.status(403).json({ error: 'Insufficient permissions to update project risk' });
        return;
      }

      // Validate owner if changing
      if (updateData.ownerId && updateData.ownerId !== risk.ownerId) {
        const owner = await this.userRepository.findOne({ where: { id: updateData.ownerId } });
        if (!owner) {
          res.status(400).json({ error: 'Risk owner not found' });
          return;
        }
      }

      // Update risk
      Object.assign(risk, updateData);

      // Recalculate risk score if probability or impact changed
      if (updateData.probability || updateData.impact) {
        const probabilityScore = this.getProbabilityScore(risk.probability);
        const impactScore = this.getImpactScore(risk.impact);
        risk.riskScore = probabilityScore * impactScore;
        risk.priorityLevel = this.calculatePriorityLevel(risk.riskScore);
      }

      // Update dates if provided
      if (updateData.mitigationTimeline) {
        risk.mitigationTimeline = new Date(updateData.mitigationTimeline);
      }
      if (updateData.targetResolutionDate) {
        risk.targetResolutionDate = new Date(updateData.targetResolutionDate);
      }
      if (updateData.actualResolutionDate) {
        risk.actualResolutionDate = new Date(updateData.actualResolutionDate);
      }

      // Update status-specific fields
      if (updateData.status === RiskStatus.MITIGATED || updateData.status === RiskStatus.CLOSED) {
        risk.actualResolutionDate = new Date();
      }

      risk.lastReviewedDate = new Date();

      const savedRisk = await this.projectRiskRepository.save(risk);

      res.json({
        message: 'Risk updated successfully',
        risk: savedRisk
      });
    } catch (error) {
      console.error('Error updating risk:', error);
      res.status(500).json({ error: 'Failed to update risk' });
    }
  }

  async deleteRisk(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const risk = await this.projectRiskRepository.findOne({
        where: { id },
        relations: ['project']
      });

      if (!risk) {
        res.status(404).json({ error: 'Risk not found' });
        return;
      }

      // Verify user has permission to delete
      const userId = req.user?.id;
      const project = risk.project;
      if (!userId || (project.founderId !== userId && project.teamLeadId !== userId)) {
        res.status(403).json({ error: 'Insufficient permissions to delete project risk' });
        return;
      }

      await this.projectRiskRepository.remove(risk);

      res.json({ message: 'Risk deleted successfully' });
    } catch (error) {
      console.error('Error deleting risk:', error);
      res.status(500).json({ error: 'Failed to delete risk' });
    }
  }

  async getRiskAnalytics(req: Request, res: Response): Promise<void> {
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
      if (!userId || (project.founderId !== userId && project.teamLeadId !== userId && !project.coreTeamMembers?.includes(userId))) {
        res.status(403).json({ error: 'Insufficient permissions to view risk analytics' });
        return;
      }

      // Risk trend over time
      const riskTrend = await this.projectRiskRepository
        .createQueryBuilder('risk')
        .select('DATE_TRUNC(\'month\', risk.identifiedDate)', 'month')
        .addSelect('COUNT(*)', 'identified')
        .addSelect('COUNT(CASE WHEN risk.status = \'mitigated\' THEN 1 END)', 'mitigated')
        .addSelect('COUNT(CASE WHEN risk.status = \'occurred\' THEN 1 END)', 'occurred')
        .where('risk.projectId = :projectId', { projectId })
        .andWhere('risk.identifiedDate >= NOW() - INTERVAL \'12 months\'')
        .groupBy('DATE_TRUNC(\'month\', risk.identifiedDate)')
        .orderBy('month', 'ASC')
        .getRawMany();

      // Risk heat map (probability vs impact)
      const riskHeatMap = await this.projectRiskRepository
        .createQueryBuilder('risk')
        .select('risk.probability', 'probability')
        .addSelect('risk.impact', 'impact')
        .addSelect('COUNT(*)', 'count')
        .addSelect('AVG(risk.riskScore)', 'avgScore')
        .where('risk.projectId = :projectId', { projectId })
        .andWhere('risk.status IN (:...activeStatuses)', { activeStatuses: [RiskStatus.ACTIVE, RiskStatus.UNDER_REVIEW] })
        .groupBy('risk.probability, risk.impact')
        .getRawMany();

      // Top risks by score
      const topRisks = await this.projectRiskRepository.find({
        where: { 
          projectId,
          status: RiskStatus.ACTIVE
        },
        relations: ['owner'],
        order: { riskScore: 'DESC' },
        take: 10
      });

      // Mitigation effectiveness
      const mitigationStats = await this.projectRiskRepository
        .createQueryBuilder('risk')
        .select('risk.category', 'category')
        .addSelect('COUNT(*)', 'total')
        .addSelect('COUNT(CASE WHEN risk.status = \'mitigated\' THEN 1 END)', 'mitigated')
        .addSelect('AVG(CASE WHEN risk.actualResolutionDate IS NOT NULL AND risk.targetResolutionDate IS NOT NULL THEN EXTRACT(days FROM risk.actualResolutionDate - risk.targetResolutionDate) END)', 'avgDelayDays')
        .where('risk.projectId = :projectId', { projectId })
        .groupBy('risk.category')
        .getRawMany();

      res.json({
        riskTrend,
        riskHeatMap,
        topRisks: topRisks.map(risk => ({
          id: risk.id,
          title: risk.title,
          category: risk.category,
          riskScore: risk.riskScore,
          status: risk.status,
          owner: risk.owner?.email,
          potentialCostImpact: risk.potentialCostImpact
        })),
        mitigationStats
      });
    } catch (error) {
      console.error('Error fetching risk analytics:', error);
      res.status(500).json({ error: 'Failed to fetch risk analytics' });
    }
  }

  // Helper methods
  private getProbabilityScore(probability: RiskProbability): number {
    const scores = {
      [RiskProbability.VERY_LOW]: 1,
      [RiskProbability.LOW]: 2,
      [RiskProbability.MEDIUM]: 3,
      [RiskProbability.HIGH]: 4,
      [RiskProbability.VERY_HIGH]: 5
    };
    return scores[probability];
  }

  private getImpactScore(impact: RiskImpact): number {
    const scores = {
      [RiskImpact.VERY_LOW]: 1,
      [RiskImpact.LOW]: 2,
      [RiskImpact.MEDIUM]: 3,
      [RiskImpact.HIGH]: 4,
      [RiskImpact.VERY_HIGH]: 5
    };
    return scores[impact];
  }

  private calculatePriorityLevel(riskScore: number): number {
    if (riskScore >= 20) return 1; // Critical
    if (riskScore >= 15) return 2; // High
    if (riskScore >= 9) return 3;  // Medium
    if (riskScore >= 4) return 4;  // Low
    return 5; // Very Low
  }

  private getCategoryBreakdown(risks: ProjectRisk[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    risks.forEach(risk => {
      breakdown[risk.category] = (breakdown[risk.category] || 0) + 1;
    });
    return breakdown;
  }
}