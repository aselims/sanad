import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { MilestoneDependency, DependencyType, DependencyStatus } from '../entities/MilestoneDependency';
import { ProjectMilestone, MilestoneStatus } from '../entities/ProjectMilestone';
import { Project } from '../entities/Project';

export class MilestoneDependencyController {
  private dependencyRepository: Repository<MilestoneDependency>;
  private milestoneRepository: Repository<ProjectMilestone>;
  private projectRepository: Repository<Project>;

  constructor() {
    this.dependencyRepository = AppDataSource.getRepository(MilestoneDependency);
    this.milestoneRepository = AppDataSource.getRepository(ProjectMilestone);
    this.projectRepository = AppDataSource.getRepository(Project);
  }

  async getAllDependencies(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const dependencies = await this.dependencyRepository
        .createQueryBuilder('dependency')
        .leftJoinAndSelect('dependency.predecessorMilestone', 'predecessor')
        .leftJoinAndSelect('dependency.successorMilestone', 'successor')
        .leftJoinAndSelect('predecessor.project', 'predecessorProject')
        .leftJoinAndSelect('successor.project', 'successorProject')
        .where('predecessorProject.founderId = :userId OR predecessorProject.teamLeadId = :userId OR successorProject.founderId = :userId OR successorProject.teamLeadId = :userId', { userId })
        .orderBy('dependency.createdAt', 'DESC')
        .getMany();
      res.json({ message: 'Dependencies retrieved successfully', dependencies, count: dependencies.length });
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      res.status(500).json({ error: 'Failed to fetch dependencies' });
    }
  }

  async createDependency(req: Request, res: Response): Promise<void> {
    try {
      const {
        predecessorMilestoneId,
        successorMilestoneId,
        type,
        lagDays,
        description,
        isHardConstraint,
        criticalityLevel
      } = req.body;

      // Validate milestones exist and belong to accessible projects
      const predecessorMilestone = await this.milestoneRepository.findOne({
        where: { id: predecessorMilestoneId },
        relations: ['project']
      });

      const successorMilestone = await this.milestoneRepository.findOne({
        where: { id: successorMilestoneId },
        relations: ['project']
      });

      if (!predecessorMilestone || !successorMilestone) {
        res.status(404).json({ error: 'One or both milestones not found' });
        return;
      }

      // Prevent circular dependencies
      if (predecessorMilestoneId === successorMilestoneId) {
        res.status(400).json({ error: 'Cannot create dependency with same milestone' });
        return;
      }

      // Check if user has access to both projects
      const userId = req.user?.id;
      if (!this.hasProjectAccess(predecessorMilestone.project, userId) || 
          !this.hasProjectAccess(successorMilestone.project, userId)) {
        res.status(403).json({ error: 'Insufficient permissions to create dependency' });
        return;
      }

      // Check if dependency already exists
      const existingDependency = await this.dependencyRepository.findOne({
        where: {
          predecessorMilestoneId,
          successorMilestoneId
        }
      });

      if (existingDependency) {
        res.status(400).json({ error: 'Dependency already exists between these milestones' });
        return;
      }

      // Check for circular dependency
      const wouldCreateCircular = await this.wouldCreateCircularDependency(
        predecessorMilestoneId, 
        successorMilestoneId
      );

      if (wouldCreateCircular) {
        res.status(400).json({ error: 'This dependency would create a circular dependency chain' });
        return;
      }

      const dependency = new MilestoneDependency();
      dependency.predecessorMilestoneId = predecessorMilestoneId;
      dependency.successorMilestoneId = successorMilestoneId;
      dependency.type = type || DependencyType.FINISH_TO_START;
      dependency.lagDays = lagDays || 0;
      dependency.description = description;
      dependency.isHardConstraint = isHardConstraint ?? true;
      dependency.criticalityLevel = criticalityLevel || 3;
      dependency.createdById = userId!;

      const savedDependency = await this.dependencyRepository.save(dependency);

      // Update successor milestone status if needed
      await this.updateMilestoneStatus(successorMilestoneId);

      res.status(201).json({
        message: 'Milestone dependency created successfully',
        dependency: savedDependency
      });
    } catch (error) {
      console.error('Error creating milestone dependency:', error);
      res.status(500).json({ error: 'Failed to create milestone dependency' });
    }
  }

  async getMilestoneDependencies(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      const { type } = req.query; // 'predecessors', 'successors', or 'all'

      const milestone = await this.milestoneRepository.findOne({
        where: { id: milestoneId },
        relations: ['project']
      });

      if (!milestone) {
        res.status(404).json({ error: 'Milestone not found' });
        return;
      }

      // Check access
      const userId = req.user?.id;
      if (!this.hasProjectAccess(milestone.project, userId)) {
        res.status(403).json({ error: 'Insufficient permissions to view dependencies' });
        return;
      }

      let dependencies: MilestoneDependency[] = [];

      if (type === 'predecessors' || type === 'all' || !type) {
        const predecessors = await this.dependencyRepository.find({
          where: { successorMilestoneId: milestoneId },
          relations: ['predecessorMilestone', 'successorMilestone', 'createdBy']
        });
        dependencies = [...dependencies, ...predecessors];
      }

      if (type === 'successors' || type === 'all' || !type) {
        const successors = await this.dependencyRepository.find({
          where: { predecessorMilestoneId: milestoneId },
          relations: ['predecessorMilestone', 'successorMilestone', 'createdBy']
        });
        dependencies = [...dependencies, ...successors];
      }

      // Remove duplicates if getting all
      if (type === 'all' || !type) {
        dependencies = dependencies.filter((dep, index, arr) => 
          arr.findIndex(d => d.id === dep.id) === index
        );
      }

      res.json({
        dependencies,
        criticalPath: await this.calculateCriticalPath(milestone.projectId)
      });
    } catch (error) {
      console.error('Error fetching milestone dependencies:', error);
      res.status(500).json({ error: 'Failed to fetch milestone dependencies' });
    }
  }

  async getProjectDependencies(req: Request, res: Response): Promise<void> {
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
      if (!this.hasProjectAccess(project, userId)) {
        res.status(403).json({ error: 'Insufficient permissions to view project dependencies' });
        return;
      }

      // Get all dependencies for milestones in this project
      const dependencies = await this.dependencyRepository
        .createQueryBuilder('dep')
        .leftJoinAndSelect('dep.predecessorMilestone', 'predMilestone')
        .leftJoinAndSelect('dep.successorMilestone', 'succMilestone')
        .leftJoinAndSelect('dep.createdBy', 'createdBy')
        .where('predMilestone.projectId = :projectId OR succMilestone.projectId = :projectId', { projectId })
        .getMany();

      // Calculate critical path
      const criticalPath = await this.calculateCriticalPath(projectId);

      // Identify blocked milestones
      const blockedMilestones = await this.getBlockedMilestones(projectId);

      res.json({
        dependencies,
        criticalPath,
        blockedMilestones,
        stats: {
          totalDependencies: dependencies.length,
          activeDependencies: dependencies.filter(d => d.status === DependencyStatus.ACTIVE).length,
          blockedDependencies: dependencies.filter(d => d.status === DependencyStatus.BLOCKED).length,
          satisfiedDependencies: dependencies.filter(d => d.status === DependencyStatus.SATISFIED).length
        }
      });
    } catch (error) {
      console.error('Error fetching project dependencies:', error);
      res.status(500).json({ error: 'Failed to fetch project dependencies' });
    }
  }

  async updateDependency(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const dependency = await this.dependencyRepository.findOne({
        where: { id },
        relations: ['predecessorMilestone', 'successorMilestone']
      });

      if (!dependency) {
        res.status(404).json({ error: 'Dependency not found' });
        return;
      }

      // Check access to both milestones
      const userId = req.user?.id;
      const predProject = await this.projectRepository.findOne({
        where: { id: dependency.predecessorMilestone.projectId },
        relations: ['founder', 'teamLead']
      });
      const succProject = await this.projectRepository.findOne({
        where: { id: dependency.successorMilestone.projectId },
        relations: ['founder', 'teamLead']
      });

      if (!predProject || !succProject || 
          !this.hasProjectAccess(predProject, userId) || 
          !this.hasProjectAccess(succProject, userId)) {
        res.status(403).json({ error: 'Insufficient permissions to update dependency' });
        return;
      }

      // Update dependency
      Object.assign(dependency, updateData);

      // Handle status changes
      if (updateData.status === DependencyStatus.SATISFIED) {
        dependency.satisfiedDate = new Date();
      } else if (updateData.status === DependencyStatus.BLOCKED) {
        dependency.blockedDate = new Date();
      }

      const savedDependency = await this.dependencyRepository.save(dependency);

      // Update related milestone statuses
      await this.updateMilestoneStatus(dependency.successorMilestoneId);

      res.json({
        message: 'Dependency updated successfully',
        dependency: savedDependency
      });
    } catch (error) {
      console.error('Error updating dependency:', error);
      res.status(500).json({ error: 'Failed to update dependency' });
    }
  }

  async deleteDependency(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const dependency = await this.dependencyRepository.findOne({
        where: { id },
        relations: ['predecessorMilestone', 'successorMilestone']
      });

      if (!dependency) {
        res.status(404).json({ error: 'Dependency not found' });
        return;
      }

      // Check access
      const userId = req.user?.id;
      const predProject = await this.projectRepository.findOne({
        where: { id: dependency.predecessorMilestone.projectId },
        relations: ['founder', 'teamLead']
      });
      const succProject = await this.projectRepository.findOne({
        where: { id: dependency.successorMilestone.projectId },
        relations: ['founder', 'teamLead']
      });

      if (!predProject || !succProject || 
          !this.hasProjectAccess(predProject, userId) || 
          !this.hasProjectAccess(succProject, userId)) {
        res.status(403).json({ error: 'Insufficient permissions to delete dependency' });
        return;
      }

      const successorMilestoneId = dependency.successorMilestoneId;

      await this.dependencyRepository.remove(dependency);

      // Update successor milestone status
      await this.updateMilestoneStatus(successorMilestoneId);

      res.json({ message: 'Dependency deleted successfully' });
    } catch (error) {
      console.error('Error deleting dependency:', error);
      res.status(500).json({ error: 'Failed to delete dependency' });
    }
  }

  // Helper methods
  private hasProjectAccess(project: Project, userId?: string): boolean {
    if (!userId) return false;
    return project.founderId === userId || 
           project.teamLeadId === userId || 
           project.coreTeamMembers?.includes(userId);
  }

  private async wouldCreateCircularDependency(predecessorId: string, successorId: string): Promise<boolean> {
    const visited = new Set<string>();
    const stack = [predecessorId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      
      if (currentId === successorId) {
        return true;
      }

      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      // Find all milestones that depend on current milestone
      const dependencies = await this.dependencyRepository.find({
        where: { successorMilestoneId: currentId }
      });

      dependencies.forEach(dep => {
        if (!visited.has(dep.predecessorMilestoneId)) {
          stack.push(dep.predecessorMilestoneId);
        }
      });
    }

    return false;
  }

  private async updateMilestoneStatus(milestoneId: string): Promise<void> {
    const milestone = await this.milestoneRepository.findOne({ where: { id: milestoneId } });
    if (!milestone) return;

    // Check if all predecessor dependencies are satisfied
    const dependencies = await this.dependencyRepository.find({
      where: { successorMilestoneId: milestoneId },
      relations: ['predecessorMilestone']
    });

    let canStart = true;
    let isBlocked = false;

    for (const dep of dependencies) {
      if (dep.status === DependencyStatus.BLOCKED) {
        isBlocked = true;
        break;
      }

      if (dep.status === DependencyStatus.ACTIVE) {
        // Check if predecessor is completed for finish-to-start dependencies
        if (dep.type === DependencyType.FINISH_TO_START && 
            dep.predecessorMilestone.status !== MilestoneStatus.COMPLETED) {
          canStart = false;
        }
        // Add other dependency type checks as needed
      }
    }

    // Update milestone status based on dependencies
    if (isBlocked && milestone.status !== MilestoneStatus.BLOCKED) {
      milestone.status = MilestoneStatus.BLOCKED;
      await this.milestoneRepository.save(milestone);
    } else if (!canStart && milestone.status === MilestoneStatus.IN_PROGRESS) {
      milestone.status = MilestoneStatus.BLOCKED;
      await this.milestoneRepository.save(milestone);
    } else if (canStart && milestone.status === MilestoneStatus.BLOCKED) {
      milestone.status = MilestoneStatus.NOT_STARTED;
      await this.milestoneRepository.save(milestone);
    }
  }

  private async calculateCriticalPath(projectId: string): Promise<any[]> {
    // This is a simplified critical path calculation
    // In a full implementation, you'd use algorithms like PERT or CPM
    
    const milestones = await this.milestoneRepository.find({
      where: { projectId },
      order: { dueDate: 'ASC' }
    });

    const dependencies = await this.dependencyRepository.find({
      relations: ['predecessorMilestone', 'successorMilestone']
    });

    // Filter dependencies for this project
    const projectDependencies = dependencies.filter(dep => 
      milestones.some(m => m.id === dep.predecessorMilestoneId) &&
      milestones.some(m => m.id === dep.successorMilestoneId)
    );

    // Simplified critical path - milestones with no slack time
    const criticalMilestones = milestones.filter(milestone => {
      const dependentMilestones = projectDependencies.filter(dep => 
        dep.predecessorMilestoneId === milestone.id
      );
      return dependentMilestones.length > 0 || milestone.status === MilestoneStatus.BLOCKED;
    });

    return criticalMilestones.map(m => ({
      id: m.id,
      title: m.title,
      dueDate: m.dueDate,
      status: m.status,
      progressPercentage: m.progressPercentage
    }));
  }

  private async getBlockedMilestones(projectId: string): Promise<any[]> {
    const blockedMilestones = await this.milestoneRepository
      .createQueryBuilder('milestone')
      .leftJoinAndSelect('milestone.assignee', 'assignee')
      .where('milestone.projectId = :projectId', { projectId })
      .andWhere('milestone.status = :status', { status: MilestoneStatus.BLOCKED })
      .getMany();

    return blockedMilestones.map(m => ({
      id: m.id,
      title: m.title,
      assignee: m.assignee?.email,
      blockers: m.blockers,
      dueDate: m.dueDate
    }));
  }
}