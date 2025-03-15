import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Partnership } from '../entities/Partnership';
import { User } from '../entities/User';
import logger from '../utils/logger';

// Get all partnerships
export const getAllPartnerships = async (req: Request, res: Response) => {
  try {
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    const partnerships = await partnershipRepository.find();
    
    return res.status(200).json({
      status: 'success',
      data: partnerships
    });
  } catch (error: any) {
    logger.error('Error fetching partnerships:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch partnerships', 
      error: error.message 
    });
  }
};

// Get partnership by ID
export const getPartnershipById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    
    const partnership = await partnershipRepository.findOne({
      where: { id }
    });

    if (!partnership) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Partnership not found' 
      });
    }

    return res.status(200).json({
      status: 'success',
      data: partnership
    });
  } catch (error: any) {
    logger.error(`Error fetching partnership with ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch partnership', 
      error: error.message 
    });
  }
};

// Create a new partnership
export const createPartnership = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      participants,
      status,
      duration,
      resources,
      expectedOutcomes
    } = req.body;

    // Get the current user
    const userId = (req.user as any).id;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    const partnershipRepository = AppDataSource.getRepository(Partnership);
    const partnership = new Partnership();
    
    partnership.title = title;
    partnership.description = description;
    partnership.participants = participants || [];
    partnership.status = status;
    partnership.duration = duration;
    partnership.resources = resources;
    partnership.expectedOutcomes = expectedOutcomes;
    partnership.createdById = user.id;
    
    // Add the creator to participants if not already included
    if (!partnership.participants.includes(`${user.firstName} ${user.lastName}`)) {
      partnership.participants.push(`${user.firstName} ${user.lastName}`);
    }

    await partnershipRepository.save(partnership);

    return res.status(201).json({
      status: 'success',
      message: 'Partnership created successfully',
      data: partnership
    });
  } catch (error: any) {
    logger.error('Error creating partnership:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to create partnership', 
      error: error.message 
    });
  }
};

// Update a partnership
export const updatePartnership = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      participants,
      status,
      duration,
      resources,
      expectedOutcomes
    } = req.body;

    const partnershipRepository = AppDataSource.getRepository(Partnership);
    const partnership = await partnershipRepository.findOne({
      where: { id }
    });

    if (!partnership) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Partnership not found' 
      });
    }

    // Check if the current user is the creator of the partnership
    const userId = (req.user as any).id;
    if (partnership.createdById !== userId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'You are not authorized to update this partnership' 
      });
    }

    // Update the partnership
    if (title) partnership.title = title;
    if (description) partnership.description = description;
    if (participants) partnership.participants = participants;
    if (status) partnership.status = status;
    if (duration) partnership.duration = duration;
    if (resources) partnership.resources = resources;
    if (expectedOutcomes) partnership.expectedOutcomes = expectedOutcomes;

    await partnershipRepository.save(partnership);

    return res.status(200).json({
      status: 'success',
      message: 'Partnership updated successfully',
      data: partnership
    });
  } catch (error: any) {
    logger.error(`Error updating partnership with ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to update partnership', 
      error: error.message 
    });
  }
};

// Delete a partnership
export const deletePartnership = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    
    const partnership = await partnershipRepository.findOne({
      where: { id }
    });

    if (!partnership) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Partnership not found' 
      });
    }

    // Check if the current user is the creator of the partnership
    const userId = (req.user as any).id;
    if (partnership.createdById !== userId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'You are not authorized to delete this partnership' 
      });
    }

    await partnershipRepository.remove(partnership);

    return res.status(200).json({ 
      status: 'success',
      message: 'Partnership deleted successfully' 
    });
  } catch (error: any) {
    logger.error(`Error deleting partnership with ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete partnership', 
      error: error.message 
    });
  }
}; 