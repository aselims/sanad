import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Project, ProjectStatus, ProjectStage } from '../entities/Project';
import { ProjectMilestone, MilestoneStatus } from '../entities/ProjectMilestone';
import { Idea, ApprovalStatus, IdeaStatus } from '../entities/Idea';
import { User } from '../entities/User';
import { In } from 'typeorm';

export class ProjectController {
  private projectRepository = AppDataSource.getRepository(Project);
  private milestoneRepository = AppDataSource.getRepository(ProjectMilestone);
  private ideaRepository = AppDataSource.getRepository(Idea);
  private userRepository = AppDataSource.getRepository(User);

  // Create new project
  async createProject(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const {
        name,
        description,
        sourceIdeaId,
        targetLaunchDate,
        estimatedBudget,
        fundingGoal,
        teamLeadId,
        coreTeamMembers = []
      } = req.body;

      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          error: 'Name and description are required'
        });
      }

      // Validate source idea if provided
      let sourceIdea = null;
      if (sourceIdeaId) {
        sourceIdea = await this.ideaRepository.findOne({
          where: { id: sourceIdeaId, approvalStatus: ApprovalStatus.APPROVED }
        });
        if (!sourceIdea) {
          return res.status(400).json({
            success: false,
            error: 'Source idea not found or not approved'
          });
        }
      }

      // Create project
      const project = this.projectRepository.create({
        name,
        description,
        sourceIdeaId: sourceIdea?.id,
        founderId: userId,
        teamLeadId: teamLeadId || userId,
        coreTeamMembers,
        targetLaunchDate: targetLaunchDate ? new Date(targetLaunchDate) : undefined,
        estimatedBudget,
        fundingGoal,
        lastStatusUpdate: new Date()
      });

      const savedProject = await this.projectRepository.save(project);

      // Create initial milestones
      const initialMilestones = [
        {
          projectId: savedProject.id,
          title: 'Project Planning',
          description: 'Define project scope, objectives, and initial requirements',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          status: MilestoneStatus.IN_PROGRESS,
          priority: 1
        },
        {
          projectId: savedProject.id,
          title: 'Market Research',
          description: 'Conduct comprehensive market research and validation',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          status: MilestoneStatus.NOT_STARTED,
          priority: 2
        },
        {
          projectId: savedProject.id,
          title: 'Business Plan Development',
          description: 'Create detailed business plan and financial projections',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
          status: MilestoneStatus.NOT_STARTED,
          priority: 3
        }
      ];

      const createdMilestones = await Promise.all(
        initialMilestones.map(milestone => 
          this.milestoneRepository.save(this.milestoneRepository.create(milestone))
        )
      );

      // Load project with relations
      const projectWithRelations = await this.projectRepository.findOne({
        where: { id: savedProject.id },
        relations: ['founder', 'teamLead', 'sourceIdea', 'milestones']
      });

      res.status(201).json({
        success: true,
        data: {
          project: projectWithRelations,
          initialMilestones: createdMilestones
        }
      });

    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create project'
      });
    }
  }

  // Get all projects for user
  async getUserProjects(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { status, stage, page = 1, limit = 10 } = req.query;

      const queryBuilder = this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.founder', 'founder')
        .leftJoinAndSelect('project.teamLead', 'teamLead')
        .leftJoinAndSelect('project.sourceIdea', 'sourceIdea')
        .leftJoinAndSelect('project.milestones', 'milestones')
        .where('project.founderId = :userId OR project.teamLeadId = :userId OR :userId = ANY(project.coreTeamMembers)', {
          userId
        });

      if (status) {
        queryBuilder.andWhere('project.status = :status', { status });
      }

      if (stage) {
        queryBuilder.andWhere('project.stage = :stage', { stage });
      }

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .orderBy('project.updatedAt', 'DESC')
        .skip(skip)
        .take(Number(limit));

      const [projects, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          projects,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects'
      });
    }
  }

  // Get project by ID
  async getProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['founder', 'teamLead', 'sourceIdea', 'milestones', 'milestones.assignee']
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Check if user has access to this project
      const hasAccess = project.founderId === userId || 
                       project.teamLeadId === userId || 
                       project.coreTeamMembers?.includes(userId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: project
      });

    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project'
      });
    }
  }

  // Update project
  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const project = await this.projectRepository.findOne({ where: { id } });
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Check permissions (founder or team lead can update)
      if (project.founderId !== userId && project.teamLeadId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      const updateData = { ...req.body };
      
      // Update validation fields based on status changes
      if (updateData.status === ProjectStatus.MVP) {
        updateData.hasMVP = true;
      }

      // Update last status update timestamp
      updateData.lastStatusUpdate = new Date();

      await this.projectRepository.update(id, updateData);

      const updatedProject = await this.projectRepository.findOne({
        where: { id },
        relations: ['founder', 'teamLead', 'sourceIdea', 'milestones']
      });

      res.json({
        success: true,
        data: updatedProject
      });

    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update project'
      });
    }
  }

  // Convert approved idea to project
  async convertIdeaToProject(req: Request, res: Response) {
    try {
      const { ideaId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Find and validate idea
      const idea = await this.ideaRepository.findOne({
        where: { id: ideaId },
        relations: ['createdBy']
      });

      if (!idea) {
        return res.status(404).json({
          success: false,
          error: 'Idea not found'
        });
      }

      if (idea.approvalStatus !== ApprovalStatus.APPROVED) {
        return res.status(400).json({
          success: false,
          error: 'Only approved ideas can be converted to projects'
        });
      }

      if (idea.createdById !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Only the idea creator can convert it to a project'
        });
      }

      // Check if project already exists for this idea
      const existingProject = await this.projectRepository.findOne({
        where: { sourceIdeaId: ideaId }
      });

      if (existingProject) {
        return res.status(400).json({
          success: false,
          error: 'Project already exists for this idea'
        });
      }

      // Create project from idea
      const project = this.projectRepository.create({
        name: idea.title,
        description: idea.description,
        sourceIdeaId: idea.id,
        founderId: userId,
        teamLeadId: userId,
        coreTeamMembers: [],
        hasValidatedIdea: true, // Since idea is approved
        estimatedBudget: idea.fundingNeeded,
        fundingGoal: idea.fundingNeeded,
        lastStatusUpdate: new Date()
      });

      const savedProject = await this.projectRepository.save(project);

      // Create business-focused initial milestones based on idea data
      const milestones = [
        {
          projectId: savedProject.id,
          title: 'Market Validation',
          description: `Validate target market: ${idea.targetMarket || 'Not specified'}`,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: MilestoneStatus.NOT_STARTED,
          priority: 1
        },
        {
          projectId: savedProject.id,
          title: 'Business Model Refinement',
          description: `Refine business model: ${idea.businessModel || 'Not specified'}`,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          status: MilestoneStatus.NOT_STARTED,
          priority: 2
        },
        {
          projectId: savedProject.id,
          title: 'Competitive Analysis',
          description: `Analyze competitive advantage: ${idea.competitiveAdvantage || 'Not specified'}`,
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          status: MilestoneStatus.NOT_STARTED,
          priority: 3
        }
      ];

      await Promise.all(
        milestones.map(milestone => 
          this.milestoneRepository.save(this.milestoneRepository.create(milestone))
        )
      );

      // Update idea status to indicate it's been converted
      await this.ideaRepository.update(ideaId, { status: IdeaStatus.ACTIVE });

      const projectWithRelations = await this.projectRepository.findOne({
        where: { id: savedProject.id },
        relations: ['founder', 'teamLead', 'sourceIdea', 'milestones']
      });

      res.status(201).json({
        success: true,
        data: projectWithRelations
      });

    } catch (error) {
      console.error('Error converting idea to project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to convert idea to project'
      });
    }
  }

  // Get project statistics
  async getProjectStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const totalProjects = await this.projectRepository.count({
        where: [
          { founderId: userId },
          { teamLeadId: userId },
          // Note: Cannot directly query array contains in TypeORM count, would need raw query
        ]
      });

      const activeProjects = await this.projectRepository.count({
        where: [
          { founderId: userId, status: In([ProjectStatus.PLANNING, ProjectStatus.DEVELOPMENT, ProjectStatus.MVP]) },
          { teamLeadId: userId, status: In([ProjectStatus.PLANNING, ProjectStatus.DEVELOPMENT, ProjectStatus.MVP]) }
        ]
      });

      const completedProjects = await this.projectRepository.count({
        where: [
          { founderId: userId, status: In([ProjectStatus.GROWTH, ProjectStatus.MATURE]) },
          { teamLeadId: userId, status: In([ProjectStatus.GROWTH, ProjectStatus.MATURE]) }
        ]
      });

      // Get milestone completion rate
      const totalMilestones = await this.milestoneRepository
        .createQueryBuilder('milestone')
        .innerJoin('milestone.project', 'project')
        .where('project.founderId = :userId OR project.teamLeadId = :userId', { userId })
        .getCount();

      const completedMilestones = await this.milestoneRepository
        .createQueryBuilder('milestone')
        .innerJoin('milestone.project', 'project')
        .where('project.founderId = :userId OR project.teamLeadId = :userId', { userId })
        .andWhere('milestone.status = :status', { status: MilestoneStatus.COMPLETED })
        .getCount();

      const milestoneCompletionRate = totalMilestones > 0 ? 
        Math.round((completedMilestones / totalMilestones) * 100) : 0;

      res.json({
        success: true,
        data: {
          totalProjects,
          activeProjects,
          completedProjects,
          milestoneCompletionRate,
          totalMilestones,
          completedMilestones
        }
      });

    } catch (error) {
      console.error('Error fetching project stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project statistics'
      });
    }
  }
}