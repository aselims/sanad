import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Challenge } from '../entities/Challenge';
import { User } from '../entities/User';
import logger from '../utils/logger';

// Get all challenges
export const getAllChallenges = async (req: Request, res: Response) => {
  try {
    const challengeRepository = AppDataSource.getRepository(Challenge);
    const challenges = await challengeRepository.find();
    
    return res.status(200).json({
      status: 'success',
      data: challenges
    });
  } catch (error: any) {
    logger.error('Error fetching challenges:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch challenges', 
      error: error.message 
    });
  }
};

// Get challenge by ID
export const getChallengeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challengeRepository = AppDataSource.getRepository(Challenge);
    
    const challenge = await challengeRepository.findOne({
      where: { id }
    });

    if (!challenge) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Challenge not found' 
      });
    }

    return res.status(200).json({
      status: 'success',
      data: challenge
    });
  } catch (error: any) {
    logger.error(`Error fetching challenge with ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch challenge', 
      error: error.message 
    });
  }
};

// Create a new challenge
export const createChallenge = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      organization,
      status,
      deadline,
      reward,
      eligibilityCriteria
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

    const challengeRepository = AppDataSource.getRepository(Challenge);
    const challenge = new Challenge();
    
    challenge.title = title;
    challenge.description = description;
    challenge.organization = organization || user.organization || '';
    challenge.status = status;
    challenge.deadline = deadline;
    challenge.reward = reward;
    challenge.eligibilityCriteria = eligibilityCriteria;
    challenge.createdById = user.id;

    await challengeRepository.save(challenge);

    return res.status(201).json({
      status: 'success',
      message: 'Challenge created successfully',
      data: challenge
    });
  } catch (error: any) {
    logger.error('Error creating challenge:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to create challenge', 
      error: error.message 
    });
  }
};

// Update a challenge
export const updateChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      organization,
      status,
      deadline,
      reward,
      eligibilityCriteria
    } = req.body;

    const challengeRepository = AppDataSource.getRepository(Challenge);
    const challenge = await challengeRepository.findOne({
      where: { id }
    });

    if (!challenge) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Challenge not found' 
      });
    }

    // Check if the current user is the creator of the challenge
    const userId = (req.user as any).id;
    if (challenge.createdById !== userId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'You are not authorized to update this challenge' 
      });
    }

    // Update the challenge
    if (title) challenge.title = title;
    if (description) challenge.description = description;
    if (organization) challenge.organization = organization;
    if (status) challenge.status = status;
    if (deadline) challenge.deadline = deadline;
    if (reward) challenge.reward = reward;
    if (eligibilityCriteria) challenge.eligibilityCriteria = eligibilityCriteria;

    await challengeRepository.save(challenge);

    return res.status(200).json({
      status: 'success',
      message: 'Challenge updated successfully',
      data: challenge
    });
  } catch (error: any) {
    logger.error(`Error updating challenge with ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to update challenge', 
      error: error.message 
    });
  }
};

// Delete a challenge
export const deleteChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challengeRepository = AppDataSource.getRepository(Challenge);
    
    const challenge = await challengeRepository.findOne({
      where: { id }
    });

    if (!challenge) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Challenge not found' 
      });
    }

    // Check if the current user is the creator of the challenge
    const userId = (req.user as any).id;
    if (challenge.createdById !== userId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'You are not authorized to delete this challenge' 
      });
    }

    await challengeRepository.remove(challenge);

    return res.status(200).json({ 
      status: 'success',
      message: 'Challenge deleted successfully' 
    });
  } catch (error: any) {
    logger.error(`Error deleting challenge with ID ${req.params.id}:`, error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete challenge', 
      error: error.message 
    });
  }
}; 