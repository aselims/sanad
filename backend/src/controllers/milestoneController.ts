import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { ProjectMilestone, MilestoneStatus } from '../entities/ProjectMilestone';
import { Project } from '../entities/Project';
import { User } from '../entities/User';

export class MilestoneController {
  private milestoneRepository = AppDataSource.getRepository(ProjectMilestone);
  private projectRepository = AppDataSource.getRepository(Project);
  private userRepository = AppDataSource.getRepository(User);

  // Create milestone
  async createMilestone(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const {
        projectId,
        title,
        description,
        dueDate,
        assigneeId,
        priority = 0,
        blockers = []
      } = req.body;

      // Validate required fields
      if (!projectId || !title || !description || !dueDate) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, title, description, and due date are required'
        });
      }

      // Check project access
      const project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const hasAccess = project.founderId === userId || 
                       project.teamLeadId === userId || 
                       project.coreTeamMembers?.includes(userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Validate assignee if provided
      if (assigneeId) {
        const assignee = await this.userRepository.findOne({ where: { id: assigneeId } });
        if (!assignee) {
          return res.status(400).json({
            success: false,
            error: 'Assignee not found'
          });
        }
      }

      const milestone = this.milestoneRepository.create({
        projectId,
        title,
        description,
        dueDate: new Date(dueDate),
        assigneeId,
        priority,
        blockers
      });

      const savedMilestone = await this.milestoneRepository.save(milestone);

      // Load with relations
      const milestoneWithRelations = await this.milestoneRepository.findOne({
        where: { id: savedMilestone.id },
        relations: ['project', 'assignee']
      });

      res.status(201).json({
        success: true,
        data: milestoneWithRelations
      });

    } catch (error) {
      console.error('Error creating milestone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create milestone'
      });
    }
  }

  // Get milestones for project
  async getProjectMilestones(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.userId;
      const { status, assigneeId, overdue } = req.query;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Check project access
      const project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const hasAccess = project.founderId === userId || 
                       project.teamLeadId === userId || 
                       project.coreTeamMembers?.includes(userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const queryBuilder = this.milestoneRepository
        .createQueryBuilder('milestone')
        .leftJoinAndSelect('milestone.assignee', 'assignee')
        .leftJoinAndSelect('milestone.project', 'project')
        .where('milestone.projectId = :projectId', { projectId });

      if (status) {
        queryBuilder.andWhere('milestone.status = :status', { status });
      }

      if (assigneeId) {
        queryBuilder.andWhere('milestone.assigneeId = :assigneeId', { assigneeId });
      }

      if (overdue === 'true') {
        queryBuilder
          .andWhere('milestone.dueDate < :now', { now: new Date() })
          .andWhere('milestone.status != :completed', { completed: MilestoneStatus.COMPLETED });
      }

      const milestones = await queryBuilder
        .orderBy('milestone.priority', 'ASC')
        .addOrderBy('milestone.dueDate', 'ASC')
        .getMany();

      res.json({
        success: true,
        data: milestones
      });

    } catch (error) {
      console.error('Error fetching project milestones:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch milestones'
      });
    }
  }

  // Update milestone
  async updateMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const milestone = await this.milestoneRepository.findOne({
        where: { id },
        relations: ['project']
      });

      if (!milestone) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
      }

      // Check project access
      const hasAccess = milestone.project.founderId === userId || 
                       milestone.project.teamLeadId === userId || 
                       milestone.project.coreTeamMembers?.includes(userId) ||
                       milestone.assigneeId === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updateData = { ...req.body };

      // Auto-set completion date when status changes to completed
      if (updateData.status === MilestoneStatus.COMPLETED && milestone.status !== MilestoneStatus.COMPLETED) {
        updateData.completedAt = new Date();
        updateData.progressPercentage = 100;
      }

      // Clear completion date if status changes away from completed
      if (updateData.status !== MilestoneStatus.COMPLETED && milestone.status === MilestoneStatus.COMPLETED) {
        updateData.completedAt = null;
      }

      await this.milestoneRepository.update(id, updateData);

      // Update project overall progress
      await this.updateProjectProgress(milestone.projectId);

      const updatedMilestone = await this.milestoneRepository.findOne({
        where: { id },
        relations: ['project', 'assignee']
      });

      res.json({
        success: true,
        data: updatedMilestone
      });

    } catch (error) {
      console.error('Error updating milestone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update milestone'
      });
    }
  }

  // Delete milestone
  async deleteMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const milestone = await this.milestoneRepository.findOne({
        where: { id },
        relations: ['project']
      });

      if (!milestone) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
      }

      // Check permissions (only project founder or team lead can delete)
      if (milestone.project.founderId !== userId && milestone.project.teamLeadId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      const projectId = milestone.projectId;
      await this.milestoneRepository.delete(id);

      // Update project overall progress
      await this.updateProjectProgress(projectId);

      res.json({
        success: true,
        message: 'Milestone deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting milestone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete milestone'
      });
    }
  }

  // Get user's assigned milestones across all projects
  async getUserMilestones(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { status, overdue, page = 1, limit = 20 } = req.query;

      const queryBuilder = this.milestoneRepository
        .createQueryBuilder('milestone')
        .leftJoinAndSelect('milestone.project', 'project')
        .leftJoinAndSelect('milestone.assignee', 'assignee')
        .where('milestone.assigneeId = :userId', { userId });

      if (status) {
        queryBuilder.andWhere('milestone.status = :status', { status });
      }

      if (overdue === 'true') {
        queryBuilder
          .andWhere('milestone.dueDate < :now', { now: new Date() })
          .andWhere('milestone.status != :completed', { completed: MilestoneStatus.COMPLETED });
      }

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .orderBy('milestone.dueDate', 'ASC')
        .skip(skip)
        .take(Number(limit));

      const [milestones, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          milestones,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user milestones:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user milestones'
      });
    }
  }

  // Private method to update project overall progress
  private async updateProjectProgress(projectId: string) {
    try {
      const milestones = await this.milestoneRepository.find({
        where: { projectId }
      });

      if (milestones.length === 0) {
        return;
      }

      const totalProgress = milestones.reduce((sum, milestone) => sum + milestone.progressPercentage, 0);
      const overallProgress = Math.round(totalProgress / milestones.length);

      await this.projectRepository.update(projectId, { 
        overallProgress,
        lastStatusUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating project progress:', error);
    }
  }

  // Get milestone statistics for project
  async getMilestoneStats(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Check project access
      const project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const hasAccess = project.founderId === userId || 
                       project.teamLeadId === userId || 
                       project.coreTeamMembers?.includes(userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const total = await this.milestoneRepository.count({ where: { projectId } });
      const completed = await this.milestoneRepository.count({ 
        where: { projectId, status: MilestoneStatus.COMPLETED } 
      });
      const inProgress = await this.milestoneRepository.count({ 
        where: { projectId, status: MilestoneStatus.IN_PROGRESS } 
      });
      const blocked = await this.milestoneRepository.count({ 
        where: { projectId, status: MilestoneStatus.BLOCKED } 
      });

      // Count overdue milestones
      const overdue = await this.milestoneRepository
        .createQueryBuilder('milestone')
        .where('milestone.projectId = :projectId', { projectId })
        .andWhere('milestone.dueDate < :now', { now: new Date() })
        .andWhere('milestone.status != :completed', { completed: MilestoneStatus.COMPLETED })
        .getCount();

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      res.json({
        success: true,
        data: {
          total,
          completed,
          inProgress,
          blocked,
          notStarted: total - completed - inProgress - blocked,
          overdue,
          completionRate
        }
      });

    } catch (error) {
      console.error('Error fetching milestone stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch milestone statistics'
      });
    }
  }
}