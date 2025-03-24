import { AppDataSource } from '../config/data-source';
import { Milestone } from '../entities/Milestone';
import { Collaboration } from '../entities/Collaboration';

const milestoneRepository = AppDataSource.getRepository(Milestone);
const collaborationRepository = AppDataSource.getRepository(Collaboration);

/**
 * Get all milestones for a specific collaboration
 * @param collaborationId ID of the collaboration
 * @returns Promise with milestones
 */
export const getMilestonesByCollaborationId = async (collaborationId: string): Promise<Milestone[]> => {
  return await milestoneRepository.find({
    where: { collaborationId },
    order: { dueDate: 'ASC' }
  });
};

/**
 * Create a new milestone for a collaboration
 * @param collaborationId ID of the collaboration
 * @param milestoneData Milestone data (name, dueDate, completed)
 * @returns Promise with created milestone
 */
export const createMilestone = async (
  collaborationId: string,
  milestoneData: {
    name: string;
    dueDate: string;
    completed?: boolean;
  }
): Promise<Milestone> => {
  // First check if the collaboration exists
  const collaboration = await collaborationRepository.findOne({
    where: { id: collaborationId }
  });

  if (!collaboration) {
    throw new Error('Collaboration not found');
  }

  // Create and save the milestone
  const milestone = new Milestone();
  milestone.name = milestoneData.name;
  milestone.dueDate = new Date(milestoneData.dueDate);
  milestone.completed = milestoneData.completed || false;
  milestone.collaborationId = collaborationId;

  return await milestoneRepository.save(milestone);
};

/**
 * Update an existing milestone
 * @param id ID of the milestone
 * @param milestoneData Updated milestone data
 * @returns Promise with updated milestone
 */
export const updateMilestone = async (
  id: string,
  milestoneData: {
    name?: string;
    dueDate?: string;
    completed?: boolean;
  }
): Promise<Milestone> => {
  // Find the milestone
  const milestone = await milestoneRepository.findOne({
    where: { id }
  });

  if (!milestone) {
    throw new Error('Milestone not found');
  }

  // Update the milestone
  if (milestoneData.name !== undefined) {
    milestone.name = milestoneData.name;
  }
  if (milestoneData.dueDate !== undefined) {
    milestone.dueDate = new Date(milestoneData.dueDate);
  }
  if (milestoneData.completed !== undefined) {
    milestone.completed = milestoneData.completed;
  }

  return await milestoneRepository.save(milestone);
};

/**
 * Delete a milestone
 * @param id ID of the milestone
 * @returns Promise with boolean indicating success
 */
export const deleteMilestone = async (id: string): Promise<boolean> => {
  const result = await milestoneRepository.delete(id);
  return result.affected ? result.affected > 0 : false;
};

/**
 * Update collaboration progress including milestones
 * @param collaborationId ID of the collaboration
 * @param progressData Progress data (progressValue, startDate, endDate, milestones)
 * @param userId ID of the user making the update
 * @returns Promise with updated collaboration
 */
export const updateCollaborationProgress = async (
  collaborationId: string,
  progressData: {
    progressValue?: number;
    startDate?: string;
    endDate?: string;
    milestones?: Array<{
      id?: string;
      name: string;
      dueDate: string;
      completed: boolean;
    }>;
  },
  userId: string
): Promise<Collaboration> => {
  // Start a transaction
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Get the collaboration with owner info
    const collaboration = await collaborationRepository.findOne({
      where: { id: collaborationId },
      relations: ['milestones']
    });

    if (!collaboration) {
      throw new Error('Collaboration not found');
    }

    // Check authorization (only owner or team members can update)
    const isOwner = collaboration.ownerId === userId;
    const isTeamMember = collaboration.teamMembers?.includes(userId) || false;

    if (!isOwner && !isTeamMember) {
      throw new Error('Not authorized to update this collaboration');
    }

    // Update progress fields
    if (progressData.progressValue !== undefined) {
      collaboration.progressValue = progressData.progressValue;
    }
    if (progressData.startDate) {
      collaboration.startDate = new Date(progressData.startDate);
    }
    if (progressData.endDate) {
      collaboration.endDate = new Date(progressData.endDate);
    }

    // Save the collaboration first
    await collaborationRepository.save(collaboration);

    // If milestones are provided, update them
    if (progressData.milestones && progressData.milestones.length > 0) {
      // Get current milestones
      const currentMilestones = await milestoneRepository.find({
        where: { collaborationId }
      });
      
      // Create a map of current milestone IDs
      const currentMilestoneMap = new Map<string, Milestone>();
      currentMilestones.forEach(m => currentMilestoneMap.set(m.id, m));
      
      // Process each milestone
      for (const milestoneData of progressData.milestones) {
        if (milestoneData.id) {
          // This is an existing milestone - update it
          const existingMilestone = currentMilestoneMap.get(milestoneData.id);
          if (existingMilestone) {
            existingMilestone.name = milestoneData.name;
            existingMilestone.dueDate = new Date(milestoneData.dueDate);
            existingMilestone.completed = milestoneData.completed;
            await milestoneRepository.save(existingMilestone);
            // Remove from map to track which ones need to be deleted
            currentMilestoneMap.delete(milestoneData.id);
          }
        } else {
          // This is a new milestone - create it
          const newMilestone = new Milestone();
          newMilestone.name = milestoneData.name;
          newMilestone.dueDate = new Date(milestoneData.dueDate);
          newMilestone.completed = milestoneData.completed;
          newMilestone.collaborationId = collaborationId;
          await milestoneRepository.save(newMilestone);
        }
      }
      
      // Delete any milestones that weren't in the update list
      const milestoneIdsToDelete = Array.from(currentMilestoneMap.keys());
      if (milestoneIdsToDelete.length > 0) {
        await milestoneRepository.delete(milestoneIdsToDelete);
      }
    }

    // Commit the transaction
    await queryRunner.commitTransaction();
    
    // Get the updated collaboration with milestones
    const updatedCollaboration = await collaborationRepository.findOne({
      where: { id: collaborationId },
      relations: ['milestones']
    });
    
    if (!updatedCollaboration) {
      throw new Error('Failed to retrieve updated collaboration');
    }
    
    return updatedCollaboration;
  } catch (error) {
    // Rollback in case of error
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
}; 