import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Idea } from '../entities/Idea';
import { User } from '../entities/User';
import logger from '../utils/logger';

// Get all ideas
export const getAllIdeas = async (req: Request, res: Response) => {
  try {
    const ideaRepository = AppDataSource.getRepository(Idea);
    const ideas = await ideaRepository.find({
      relations: ['createdBy'],
    });

    // Format the response to include creator information
    const formattedIdeas = ideas.map(idea => {
      const { createdBy, ...ideaData } = idea;
      return {
        ...ideaData,
        creatorName: createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : 'Unknown',
        creatorEmail: createdBy ? createdBy.email : '',
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

    idea.title = title;
    idea.description = description;
    idea.category = category;
    idea.stage = stage;
    idea.targetAudience = targetAudience;
    idea.potentialImpact = potentialImpact;
    idea.resourcesNeeded = resourcesNeeded;
    idea.status = status;
    idea.createdBy = user;
    idea.createdById = user.id;

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
