import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { TeamInvitation, InvitationStatus, InvitationType } from '../entities/TeamInvitation';
import { User } from '../entities/User';
import { Idea } from '../entities/Idea';
import logger from '../utils/logger';

// Create a team invitation
export const createInvitation = async (req: Request, res: Response) => {
  try {
    const {
      toUserId,
      ideaId,
      invitationType,
      message,
      additionalData,
      expiresInDays = 7,
    } = req.body;

    // Get the current user (sender)
    const fromUserId = (req.user as any).id;
    const userRepository = AppDataSource.getRepository(User);
    const ideaRepository = AppDataSource.getRepository(Idea);
    const invitationRepository = AppDataSource.getRepository(TeamInvitation);

    // Validate sender exists
    const fromUser = await userRepository.findOne({ where: { id: fromUserId } });
    if (!fromUser) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Validate recipient exists
    const toUser = await userRepository.findOne({ where: { id: toUserId } });
    if (!toUser) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Validate idea exists if ideaId is provided
    let idea = null;
    if (ideaId) {
      idea = await ideaRepository.findOne({ where: { id: ideaId } });
      if (!idea) {
        return res.status(404).json({ message: 'Idea not found' });
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await invitationRepository.findOne({
      where: {
        fromUserId,
        toUserId,
        ideaId: ideaId || null,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Pending invitation already exists' });
    }

    // Create new invitation
    const invitation = new TeamInvitation();
    invitation.fromUserId = fromUserId;
    invitation.toUserId = toUserId;
    invitation.ideaId = ideaId || null;
    invitation.invitationType = invitationType || InvitationType.TEAM_MEMBER;
    invitation.message = message;
    invitation.additionalData = additionalData;
    
    // Set expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    invitation.expiresAt = expiresAt;

    await invitationRepository.save(invitation);

    // Return invitation with user details
    const invitationWithDetails = await invitationRepository.findOne({
      where: { id: invitation.id },
      relations: ['fromUser', 'toUser', 'idea'],
    });

    return res.status(201).json({
      message: 'Team invitation created successfully',
      invitation: invitationWithDetails,
    });
  } catch (error: any) {
    logger.error('Error creating team invitation:', error);
    return res.status(500).json({ message: 'Failed to create invitation', error: error.message });
  }
};

// Get invitations for a user (sent and received)
export const getUserInvitations = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { type = 'received', status } = req.query;
    const invitationRepository = AppDataSource.getRepository(TeamInvitation);

    let whereCondition: any = {};
    
    if (type === 'sent') {
      whereCondition.fromUserId = userId;
    } else {
      whereCondition.toUserId = userId;
    }

    if (status) {
      whereCondition.status = status;
    }

    const invitations = await invitationRepository.find({
      where: whereCondition,
      relations: ['fromUser', 'toUser', 'idea'],
      order: { createdAt: 'DESC' },
    });

    const formattedInvitations = invitations.map(invitation => ({
      ...invitation,
      fromUserName: `${invitation.fromUser.firstName} ${invitation.fromUser.lastName}`,
      toUserName: `${invitation.toUser.firstName} ${invitation.toUser.lastName}`,
      ideaTitle: invitation.idea ? invitation.idea.title : null,
    }));

    return res.status(200).json({
      message: 'Invitations retrieved successfully',
      invitations: formattedInvitations,
    });
  } catch (error: any) {
    logger.error('Error fetching user invitations:', error);
    return res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
  }
};

// Respond to team invitation (accept/reject)
export const respondToInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, responseMessage } = req.body; // action: 'accept' or 'reject'
    const userId = (req.user as any).id;

    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Valid action (accept/reject) is required' });
    }

    const invitationRepository = AppDataSource.getRepository(TeamInvitation);
    
    const invitation = await invitationRepository.findOne({
      where: { id },
      relations: ['fromUser', 'toUser', 'idea'],
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if the current user is the recipient
    if (invitation.toUserId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to respond to this invitation' });
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      return res.status(400).json({ message: 'Invitation has already been responded to' });
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      invitation.status = InvitationStatus.EXPIRED;
      await invitationRepository.save(invitation);
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    // Update invitation status
    invitation.status = action === 'accept' ? InvitationStatus.ACCEPTED : InvitationStatus.REJECTED;
    invitation.responseMessage = responseMessage;
    invitation.respondedAt = new Date();

    await invitationRepository.save(invitation);

    return res.status(200).json({
      message: `Invitation ${action}ed successfully`,
      invitation: {
        ...invitation,
        fromUserName: `${invitation.fromUser.firstName} ${invitation.fromUser.lastName}`,
        toUserName: `${invitation.toUser.firstName} ${invitation.toUser.lastName}`,
        ideaTitle: invitation.idea ? invitation.idea.title : null,
      },
    });
  } catch (error: any) {
    logger.error('Error responding to invitation:', error);
    return res.status(500).json({ message: 'Failed to respond to invitation', error: error.message });
  }
};

// Cancel a sent invitation
export const cancelInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any).id;

    const invitationRepository = AppDataSource.getRepository(TeamInvitation);
    
    const invitation = await invitationRepository.findOne({
      where: { id },
      relations: ['fromUser', 'toUser'],
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if the current user is the sender
    if (invitation.fromUserId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this invitation' });
    }

    // Check if invitation is still pending
    if (invitation.status !== InvitationStatus.PENDING) {
      return res.status(400).json({ message: 'Can only cancel pending invitations' });
    }

    // Cancel invitation
    invitation.status = InvitationStatus.CANCELLED;
    await invitationRepository.save(invitation);

    return res.status(200).json({
      message: 'Invitation cancelled successfully',
      invitation,
    });
  } catch (error: any) {
    logger.error('Error cancelling invitation:', error);
    return res.status(500).json({ message: 'Failed to cancel invitation', error: error.message });
  }
};

// Search for potential co-founders based on skills and preferences
export const findPotentialCoFounders = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { 
      requiredSkills = [], 
      industryPreferences = [], 
      experienceLevel,
      availabilityStatus = 'available',
      limit = 20 
    } = req.query;

    const userRepository = AppDataSource.getRepository(User);
    const queryBuilder = userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skill')
      .where('user.id != :userId', { userId })
      .andWhere('user.lookingForCofounder = :lookingForCofounder', { lookingForCofounder: true })
      .andWhere('user.availabilityStatus = :availabilityStatus', { availabilityStatus })
      .andWhere('user.isActive = :isActive', { isActive: true });

    // Filter by required skills if provided
    if (requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      queryBuilder.andWhere('skill.skillName IN (:...skills)', { skills: requiredSkills });
    }

    // Filter by industry preferences if provided
    if (industryPreferences && Array.isArray(industryPreferences) && industryPreferences.length > 0) {
      queryBuilder.andWhere('user.preferredIndustries && :industries', { 
        industries: industryPreferences 
      });
    }

    // Filter by experience level if provided
    if (experienceLevel) {
      queryBuilder.andWhere('user.experienceLevel = :experienceLevel', { experienceLevel });
    }

    const potentialCoFounders = await queryBuilder
      .take(parseInt(limit as string))
      .getMany();

    // Format response to hide sensitive information
    const formattedResults = potentialCoFounders.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      bio: user.bio,
      organization: user.organization,
      position: user.position,
      location: user.location,
      experienceLevel: user.experienceLevel,
      skills: user.skills?.filter(skill => skill.isVisible).map(skill => ({
        skillName: skill.skillName,
        proficiencyLevel: skill.proficiencyLevel,
        yearsExperience: skill.yearsExperience,
      })),
      preferredIndustries: user.preferredIndustries,
      preferredCompanyStages: user.preferredCompanyStages,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture,
    }));

    return res.status(200).json({
      message: 'Potential co-founders found successfully',
      coFounders: formattedResults,
      count: formattedResults.length,
    });
  } catch (error: any) {
    logger.error('Error finding potential co-founders:', error);
    return res.status(500).json({ message: 'Failed to find potential co-founders', error: error.message });
  }
};