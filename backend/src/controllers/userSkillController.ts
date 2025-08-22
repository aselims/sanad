import { Request, Response } from 'express';
import { UserSkillService } from '../services/userSkillService';
import logger from '../utils/logger';

const userSkillService = new UserSkillService();

export class UserSkillController {
  async createSkill(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { skillName, proficiencyLevel, yearsExperience, certifications, portfolioItems, isHighlighted } = req.body;

      // Validation
      if (!skillName || proficiencyLevel < 1 || proficiencyLevel > 5) {
        res.status(400).json({ 
          success: false, 
          message: 'Skill name is required and proficiency level must be between 1 and 5' 
        });
        return;
      }

      const skill = await userSkillService.createSkill(userId, {
        skillName: skillName.trim(),
        proficiencyLevel,
        yearsExperience: yearsExperience || 0,
        certifications,
        portfolioItems,
        isHighlighted: isHighlighted || false,
      });

      res.status(201).json({ success: true, data: skill });
    } catch (error) {
      logger.error('Error creating skill:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSkill(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { skillId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const updateData = req.body;

      // Validate proficiency level if provided
      if (updateData.proficiencyLevel && (updateData.proficiencyLevel < 1 || updateData.proficiencyLevel > 5)) {
        res.status(400).json({ 
          success: false, 
          message: 'Proficiency level must be between 1 and 5' 
        });
        return;
      }

      const skill = await userSkillService.updateSkill(skillId, userId, updateData);

      res.json({ success: true, data: skill });
    } catch (error) {
      logger.error('Error updating skill:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteSkill(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { skillId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      await userSkillService.deleteSkill(skillId, userId);

      res.json({ success: true, message: 'Skill deleted successfully' });
    } catch (error) {
      logger.error('Error deleting skill:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserSkills(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;
      const includeHidden = req.query.includeHidden === 'true' && userId === currentUserId;

      const skills = await userSkillService.getUserSkills(userId, includeHidden);

      res.json({ success: true, data: skills });
    } catch (error) {
      logger.error('Error fetching user skills:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getMySkills(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const includeHidden = req.query.includeHidden === 'true';
      const skills = await userSkillService.getUserSkills(userId, includeHidden);

      res.json({ success: true, data: skills });
    } catch (error) {
      logger.error('Error fetching user skills:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async endorseSkill(req: Request, res: Response): Promise<void> {
    try {
      const endorserId = req.user?.id;
      const { skillId } = req.params;

      if (!endorserId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const skill = await userSkillService.endorseSkill(skillId, endorserId);

      res.json({ success: true, data: skill, message: 'Skill endorsed successfully' });
    } catch (error) {
      logger.error('Error endorsing skill:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeEndorsement(req: Request, res: Response): Promise<void> {
    try {
      const endorserId = req.user?.id;
      const { skillId } = req.params;

      if (!endorserId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const skill = await userSkillService.removeEndorsement(skillId, endorserId);

      res.json({ success: true, data: skill, message: 'Endorsement removed successfully' });
    } catch (error) {
      logger.error('Error removing endorsement:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async searchSkills(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm, limit } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({ success: false, message: 'Search term is required' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string) : 50;
      const skills = await userSkillService.searchSkills(searchTerm, limitNum);

      res.json({ success: true, data: skills });
    } catch (error) {
      logger.error('Error searching skills:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getSkillCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await userSkillService.getSkillCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      logger.error('Error fetching skill categories:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async findMatchingUsers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { skills } = req.body;
      if (!Array.isArray(skills) || skills.length === 0) {
        res.status(400).json({ success: false, message: 'Skills array is required' });
        return;
      }

      const matchingUsers = await userSkillService.findMatchingSkills(userId, skills);

      res.json({ success: true, data: matchingUsers });
    } catch (error) {
      logger.error('Error finding matching users:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export const userSkillController = new UserSkillController();
