import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { ProjectResource, ResourceType, AllocationStatus } from '../entities/ProjectResource';
import { Project } from '../entities/Project';
import { User } from '../entities/User';

export class ProjectResourceController {
  private projectResourceRepository: Repository<ProjectResource>;
  private projectRepository: Repository<Project>;
  private userRepository: Repository<User>;

  constructor() {
    this.projectResourceRepository = AppDataSource.getRepository(ProjectResource);
    this.projectRepository = AppDataSource.getRepository(Project);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createResource(req: Request, res: Response): Promise<void> {
    try {
      const {
        projectId,
        name,
        description,
        type,
        budgetAllocated,
        costPerUnit,
        currency,
        quantityRequired,
        allocationStartDate,
        allocationEndDate,
        assignedToId,
        supplierVendor,
        tags,
        notes,
        isCritical
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
        res.status(403).json({ error: 'Insufficient permissions to manage project resources' });
        return;
      }

      // Validate assigned user if provided
      if (assignedToId) {
        const assignedUser = await this.userRepository.findOne({ where: { id: assignedToId } });
        if (!assignedUser) {
          res.status(400).json({ error: 'Assigned user not found' });
          return;
        }
      }

      const resource = new ProjectResource();
      resource.projectId = projectId;
      resource.name = name;
      resource.description = description;
      resource.type = type;
      resource.budgetAllocated = budgetAllocated;
      resource.costPerUnit = costPerUnit;
      resource.currency = currency || 'USD';
      resource.quantityRequired = quantityRequired || 1;
      resource.allocationStartDate = allocationStartDate ? new Date(allocationStartDate) : null;
      resource.allocationEndDate = allocationEndDate ? new Date(allocationEndDate) : null;
      resource.assignedToId = assignedToId;
      resource.supplierVendor = supplierVendor;
      resource.tags = tags || [];
      resource.notes = notes;
      resource.isCritical = isCritical || false;

      const savedResource = await this.projectResourceRepository.save(resource);

      res.status(201).json({
        message: 'Project resource created successfully',
        resource: savedResource
      });
    } catch (error) {
      console.error('Error creating project resource:', error);
      res.status(500).json({ error: 'Failed to create project resource' });
    }
  }

  async getProjectResources(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { type, status, critical } = req.query;

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
        res.status(403).json({ error: 'Insufficient permissions to view project resources' });
        return;
      }

      const queryBuilder = this.projectResourceRepository
        .createQueryBuilder('resource')
        .leftJoinAndSelect('resource.assignedTo', 'assignedTo')
        .where('resource.projectId = :projectId', { projectId });

      if (type) {
        queryBuilder.andWhere('resource.type = :type', { type });
      }

      if (status) {
        queryBuilder.andWhere('resource.status = :status', { status });
      }

      if (critical === 'true') {
        queryBuilder.andWhere('resource.isCritical = true');
      }

      queryBuilder.orderBy('resource.createdAt', 'DESC');

      const resources = await queryBuilder.getMany();

      // Calculate budget summary
      const budgetSummary = {
        totalAllocated: 0,
        totalUsed: 0,
        utilizationRate: 0,
        criticalResources: 0
      };

      resources.forEach(resource => {
        budgetSummary.totalAllocated += Number(resource.budgetAllocated) || 0;
        budgetSummary.totalUsed += Number(resource.budgetUsed) || 0;
        if (resource.isCritical) {
          budgetSummary.criticalResources++;
        }
      });

      budgetSummary.utilizationRate = budgetSummary.totalAllocated > 0 
        ? (budgetSummary.totalUsed / budgetSummary.totalAllocated) * 100 
        : 0;

      res.json({
        resources,
        summary: budgetSummary
      });
    } catch (error) {
      console.error('Error fetching project resources:', error);
      res.status(500).json({ error: 'Failed to fetch project resources' });
    }
  }

  async updateResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const resource = await this.projectResourceRepository.findOne({
        where: { id },
        relations: ['project', 'assignedTo']
      });

      if (!resource) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      // Verify user has permission to update
      const userId = req.user?.id;
      const project = resource.project;
      if (!userId || (project.founderId !== userId && project.teamLeadId !== userId && !project.coreTeamMembers?.includes(userId))) {
        res.status(403).json({ error: 'Insufficient permissions to update project resource' });
        return;
      }

      // Validate assigned user if changing
      if (updateData.assignedToId && updateData.assignedToId !== resource.assignedToId) {
        const assignedUser = await this.userRepository.findOne({ where: { id: updateData.assignedToId } });
        if (!assignedUser) {
          res.status(400).json({ error: 'Assigned user not found' });
          return;
        }
      }

      // Update resource
      Object.assign(resource, updateData);

      if (updateData.allocationStartDate) {
        resource.allocationStartDate = new Date(updateData.allocationStartDate);
      }
      if (updateData.allocationEndDate) {
        resource.allocationEndDate = new Date(updateData.allocationEndDate);
      }
      if (updateData.actualStartDate) {
        resource.actualStartDate = new Date(updateData.actualStartDate);
      }
      if (updateData.actualEndDate) {
        resource.actualEndDate = new Date(updateData.actualEndDate);
      }

      const savedResource = await this.projectResourceRepository.save(resource);

      res.json({
        message: 'Resource updated successfully',
        resource: savedResource
      });
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(500).json({ error: 'Failed to update resource' });
    }
  }

  async deleteResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const resource = await this.projectResourceRepository.findOne({
        where: { id },
        relations: ['project']
      });

      if (!resource) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      // Verify user has permission to delete
      const userId = req.user?.id;
      const project = resource.project;
      if (!userId || (project.founderId !== userId && project.teamLeadId !== userId)) {
        res.status(403).json({ error: 'Insufficient permissions to delete project resource' });
        return;
      }

      await this.projectResourceRepository.remove(resource);

      res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ error: 'Failed to delete resource' });
    }
  }

  async getResourceAnalytics(req: Request, res: Response): Promise<void> {
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
        res.status(403).json({ error: 'Insufficient permissions to view analytics' });
        return;
      }

      // Resource type distribution
      const typeDistribution = await this.projectResourceRepository
        .createQueryBuilder('resource')
        .select('resource.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(resource.budgetAllocated)', 'totalBudget')
        .where('resource.projectId = :projectId', { projectId })
        .groupBy('resource.type')
        .getRawMany();

      // Status distribution
      const statusDistribution = await this.projectResourceRepository
        .createQueryBuilder('resource')
        .select('resource.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(resource.budgetUsed)', 'totalUsed')
        .where('resource.projectId = :projectId', { projectId })
        .groupBy('resource.status')
        .getRawMany();

      // Budget utilization over time (last 6 months)
      const budgetUtilization = await this.projectResourceRepository
        .createQueryBuilder('resource')
        .select('DATE_TRUNC(\'month\', resource.createdAt)', 'month')
        .addSelect('SUM(resource.budgetAllocated)', 'allocated')
        .addSelect('SUM(resource.budgetUsed)', 'used')
        .where('resource.projectId = :projectId', { projectId })
        .andWhere('resource.createdAt >= NOW() - INTERVAL \'6 months\'')
        .groupBy('DATE_TRUNC(\'month\', resource.createdAt)')
        .orderBy('month', 'ASC')
        .getRawMany();

      // Critical resource alerts
      const criticalResources = await this.projectResourceRepository.find({
        where: { 
          projectId, 
          isCritical: true,
          status: AllocationStatus.IN_USE
        },
        relations: ['assignedTo']
      });

      res.json({
        typeDistribution,
        statusDistribution,
        budgetUtilization,
        criticalResources: criticalResources.map(resource => ({
          id: resource.id,
          name: resource.name,
          type: resource.type,
          utilizationPercentage: resource.utilizationPercentage,
          assignedTo: resource.assignedTo?.email
        }))
      });
    } catch (error) {
      console.error('Error fetching resource analytics:', error);
      res.status(500).json({ error: 'Failed to fetch resource analytics' });
    }
  }
}