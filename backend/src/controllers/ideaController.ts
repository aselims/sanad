import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Idea, IdeaStatus, ApprovalStatus } from '../entities/Idea';
import { User } from '../entities/User';
import logger from '../utils/logger';

// Get all ideas with filtering support
export const getAllIdeas = async (req: Request, res: Response) => {
  try {
    const ideaRepository = AppDataSource.getRepository(Idea);
    const { status, stage, approvalStatus, submissionCompleted, category } = req.query;

    // Build where condition based on filters
    const whereConditions: any = {};
    if (status) whereConditions.status = status;
    if (stage) whereConditions.stage = stage;
    if (approvalStatus) whereConditions.approvalStatus = approvalStatus;
    if (submissionCompleted !== undefined) whereConditions.submissionCompleted = submissionCompleted === 'true';
    if (category) whereConditions.category = category;

    const ideas = await ideaRepository.find({
      where: whereConditions,
      relations: ['createdBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });

    // Format the response to include creator information
    const formattedIdeas = ideas.map(idea => {
      const { createdBy, approvedBy, ...ideaData } = idea;
      return {
        ...ideaData,
        creatorName: createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'Unknown',
        creatorEmail: createdBy ? createdBy.email : '',
        approvedByName: approvedBy ? `${approvedBy.firstName} ${approvedBy.lastName}` : null,
      };
    });

    return res.status(200).json(formattedIdeas);
  } catch (error: any) {
    logger.error('Error fetching ideas:', error);
    return res.status(500).json({ message: 'Failed to fetch ideas', error: error.message });
  }
};

// Get idea by ID
export const getIdeaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ideaRepository = AppDataSource.getRepository(Idea);

    const idea = await ideaRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Format the response to include creator information
    const { createdBy, ...ideaData } = idea;
    const formattedIdea = {
      ...ideaData,
      creatorName: createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'Unknown',
      creatorEmail: createdBy ? createdBy.email : '',
    };

    return res.status(200).json(formattedIdea);
  } catch (error: any) {
    logger.error(`Error fetching idea with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Failed to fetch idea', error: error.message });
  }
};

// Create a new idea
export const createIdea = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      stage,
      targetAudience,
      potentialImpact,
      resourcesNeeded,
      status,
      businessModel,
      targetMarket,
      competitiveAdvantage,
      fundingNeeded,
      timeline,
      riskFactors,
      successMetrics,
      attachments,
    } = req.body;

    // Get the current user
    const userId = (req.user as any).id;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ideaRepository = AppDataSource.getRepository(Idea);
    const idea = new Idea();

    // Basic idea fields
    idea.title = title;
    idea.description = description;
    idea.category = category;
    idea.stage = stage;
    idea.targetAudience = targetAudience;
    idea.potentialImpact = potentialImpact;
    idea.resourcesNeeded = resourcesNeeded;
    idea.status = status || 'draft';
    idea.createdBy = user;
    idea.createdById = user.id;

    // Business-focused fields
    if (businessModel) idea.businessModel = businessModel;
    if (targetMarket) idea.targetMarket = targetMarket;
    if (competitiveAdvantage) idea.competitiveAdvantage = competitiveAdvantage;
    if (fundingNeeded) idea.fundingNeeded = fundingNeeded;
    if (timeline) idea.timeline = timeline;
    if (riskFactors) idea.riskFactors = riskFactors;
    if (successMetrics) idea.successMetrics = successMetrics;
    if (attachments) idea.attachments = attachments;

    // Set the creator as the first participant
    idea.participants = [`${user.firstName} ${user.lastName}`];

    await ideaRepository.save(idea);

    return res.status(201).json({
      message: 'Idea created successfully',
      idea: {
        ...idea,
        creatorName: `${user.firstName} ${user.lastName}`,
        creatorEmail: user.email,
      },
    });
  } catch (error: any) {
    logger.error('Error creating idea:', error);
    return res.status(500).json({ message: 'Failed to create idea', error: error.message });
  }
};

// Update an idea
export const updateIdea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      stage,
      targetAudience,
      potentialImpact,
      resourcesNeeded,
      status,
      participants,
    } = req.body;

    const ideaRepository = AppDataSource.getRepository(Idea);
    const idea = await ideaRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check if the current user is the creator of the idea
    const userId = (req.user as any).id;
    if (idea.createdById !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this idea' });
    }

    // Update the idea
    if (title) idea.title = title;
    if (description) idea.description = description;
    if (category) idea.category = category;
    if (stage) idea.stage = stage;
    if (targetAudience) idea.targetAudience = targetAudience;
    if (potentialImpact) idea.potentialImpact = potentialImpact;
    if (resourcesNeeded) idea.resourcesNeeded = resourcesNeeded;
    if (status) idea.status = status;
    if (participants) idea.participants = participants;

    await ideaRepository.save(idea);

    return res.status(200).json({
      message: 'Idea updated successfully',
      idea: {
        ...idea,
        creatorName: idea.createdBy
          ? `${idea.createdBy.firstName} ${idea.createdBy.lastName}`
          : 'Unknown',
        creatorEmail: idea.createdBy ? idea.createdBy.email : '',
      },
    });
  } catch (error: any) {
    logger.error(`Error updating idea with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Failed to update idea', error: error.message });
  }
};

// Delete an idea
export const deleteIdea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ideaRepository = AppDataSource.getRepository(Idea);

    const idea = await ideaRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check if the current user is the creator of the idea
    const userId = (req.user as any).id;
    if (idea.createdById !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this idea' });
    }

    await ideaRepository.remove(idea);

    return res.status(200).json({ message: 'Idea deleted successfully' });
  } catch (error: any) {
    logger.error(`Error deleting idea with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Failed to delete idea', error: error.message });
  }
};

// Complete idea submission (PUT /api/ideas/:id/complete)
export const completeIdeaSubmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ideaRepository = AppDataSource.getRepository(Idea);

    const idea = await ideaRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Check if the current user is the creator of the idea
    const userId = (req.user as any).id;
    if (idea.createdById !== userId) {
      return res.status(403).json({ message: 'You are not authorized to complete this idea submission' });
    }

    // Validate that required fields are completed
    const requiredFields = [
      'title', 'description', 'category', 'targetAudience', 
      'potentialImpact', 'businessModel', 'targetMarket'
    ];
    
    const missingFields = requiredFields.filter(field => !idea[field as keyof Idea]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot complete submission. Missing required fields', 
        missingFields 
      });
    }

    // Mark as completed and submitted
    idea.submissionCompleted = true;
    idea.submittedAt = new Date();
    idea.status = IdeaStatus.SUBMITTED;

    await ideaRepository.save(idea);

    return res.status(200).json({
      message: 'Idea submission completed successfully',
      idea: {
        ...idea,
        creatorName: idea.createdBy ? `${idea.createdBy.firstName} ${idea.createdBy.lastName}` : 'Unknown',
        creatorEmail: idea.createdBy ? idea.createdBy.email : '',
      },
    });
  } catch (error: any) {
    logger.error(`Error completing idea submission with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Failed to complete idea submission', error: error.message });
  }
};

// Admin approve idea
export const approveIdea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminFeedback } = req.body;
    const adminUserId = (req.user as any).id;

    const ideaRepository = AppDataSource.getRepository(Idea);
    const userRepository = AppDataSource.getRepository(User);

    // Check if the current user is an admin
    const adminUser = await userRepository.findOne({ where: { id: adminUserId } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const idea = await ideaRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Update approval status
    idea.approvalStatus = ApprovalStatus.APPROVED;
    idea.status = IdeaStatus.APPROVED;
    idea.approvedById = adminUserId;
    idea.approvedAt = new Date();
    if (adminFeedback) idea.adminFeedback = adminFeedback;

    await ideaRepository.save(idea);

    return res.status(200).json({
      message: 'Idea approved successfully',
      idea: {
        ...idea,
        creatorName: idea.createdBy ? `${idea.createdBy.firstName} ${idea.createdBy.lastName}` : 'Unknown',
        approvedByName: `${adminUser.firstName} ${adminUser.lastName}`,
      },
    });
  } catch (error: any) {
    logger.error(`Error approving idea with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Failed to approve idea', error: error.message });
  }
};

// Admin reject idea
export const rejectIdea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason, adminFeedback } = req.body;
    const adminUserId = (req.user as any).id;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const ideaRepository = AppDataSource.getRepository(Idea);
    const userRepository = AppDataSource.getRepository(User);

    // Check if the current user is an admin
    const adminUser = await userRepository.findOne({ where: { id: adminUserId } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const idea = await ideaRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    // Update rejection status
    idea.approvalStatus = ApprovalStatus.REJECTED;
    idea.status = IdeaStatus.REJECTED;
    idea.rejectionReason = rejectionReason;
    if (adminFeedback) idea.adminFeedback = adminFeedback;
    idea.approvedById = adminUserId;
    idea.approvedAt = new Date();

    await ideaRepository.save(idea);

    return res.status(200).json({
      message: 'Idea rejected',
      idea: {
        ...idea,
        creatorName: idea.createdBy ? `${idea.createdBy.firstName} ${idea.createdBy.lastName}` : 'Unknown',
        rejectedByName: `${adminUser.firstName} ${adminUser.lastName}`,
      },
    });
  } catch (error: any) {
    logger.error(`Error rejecting idea with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Failed to reject idea', error: error.message });
  }
};

// Get ideas for admin review
export const getIdeasForReview = async (req: Request, res: Response) => {
  try {
    const adminUserId = (req.user as any).id;
    const userRepository = AppDataSource.getRepository(User);

    // Check if the current user is an admin
    const adminUser = await userRepository.findOne({ where: { id: adminUserId } });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const ideaRepository = AppDataSource.getRepository(Idea);
    
    const ideas = await ideaRepository.find({
      where: { 
        status: IdeaStatus.SUBMITTED,
        submissionCompleted: true 
      },
      relations: ['createdBy'],
      order: { submittedAt: 'ASC' },
    });

    const formattedIdeas = ideas.map(idea => {
      const { createdBy, ...ideaData } = idea;
      return {
        ...ideaData,
        creatorName: createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'Unknown',
        creatorEmail: createdBy ? createdBy.email : '',
      };
    });

    return res.status(200).json({
      message: 'Ideas for review retrieved successfully',
      ideas: formattedIdeas,
      count: formattedIdeas.length,
    });
  } catch (error: any) {
    logger.error('Error fetching ideas for review:', error);
    return res.status(500).json({ message: 'Failed to fetch ideas for review', error: error.message });
  }
};
