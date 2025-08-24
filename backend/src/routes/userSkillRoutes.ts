import { Router } from 'express';
import { userSkillController } from '../controllers/userSkillController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// My Skills (current user)
router.get('/my-skills', userSkillController.getMySkills.bind(userSkillController));

// Create a new skill
router.post('/', userSkillController.createSkill.bind(userSkillController));

// Update a skill
router.put('/:skillId', userSkillController.updateSkill.bind(userSkillController));

// Delete a skill
router.delete('/:skillId', userSkillController.deleteSkill.bind(userSkillController));

// Get skills for a specific user
router.get('/users/:userId', userSkillController.getUserSkills.bind(userSkillController));

// Skill endorsements
router.post('/:skillId/endorse', userSkillController.endorseSkill.bind(userSkillController));
router.delete('/:skillId/endorse', userSkillController.removeEndorsement.bind(userSkillController));

// Search and discovery
router.get('/search', userSkillController.searchSkills.bind(userSkillController));
router.get('/categories', userSkillController.getSkillCategories.bind(userSkillController));

// Find users with matching skills
router.post('/find-matches', userSkillController.findMatchingUsers.bind(userSkillController));

export default router;
