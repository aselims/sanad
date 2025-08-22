import api from './api';
import { 
  UserSkill, 
  CreateUserSkillDto, 
  UpdateUserSkillDto, 
  ApiResponse,
  User,
  UserSkillWithUser
} from '../types/user';

/**
 * Skills API service for managing user skills
 */

// Get my skills
export const getMySkills = async (includeHidden: boolean = false): Promise<UserSkill[]> => {
  const response = await api.get<ApiResponse<UserSkill[]>>('/skills/my-skills', {
    params: { includeHidden }
  });
  return response.data.data || [];
};

// Get skills for a specific user
export const getUserSkills = async (userId: string, includeHidden: boolean = false): Promise<UserSkill[]> => {
  const response = await api.get<ApiResponse<UserSkill[]>>(`/skills/users/${userId}`, {
    params: { includeHidden }
  });
  return response.data.data || [];
};

// Create a new skill
export const createSkill = async (skillData: CreateUserSkillDto): Promise<UserSkill> => {
  const response = await api.post<ApiResponse<UserSkill>>('/skills', skillData);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to create skill');
  }
  return response.data.data!;
};

// Update an existing skill
export const updateSkill = async (skillId: string, skillData: UpdateUserSkillDto): Promise<UserSkill> => {
  const response = await api.put<ApiResponse<UserSkill>>(`/skills/${skillId}`, skillData);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update skill');
  }
  return response.data.data!;
};

// Delete a skill
export const deleteSkill = async (skillId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/skills/${skillId}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to delete skill');
  }
};

// Endorse a skill
export const endorseSkill = async (skillId: string): Promise<UserSkill> => {
  const response = await api.post<ApiResponse<UserSkill>>(`/skills/${skillId}/endorse`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to endorse skill');
  }
  return response.data.data!;
};

// Remove skill endorsement
export const removeEndorsement = async (skillId: string): Promise<UserSkill> => {
  const response = await api.delete<ApiResponse<UserSkill>>(`/skills/${skillId}/endorse`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to remove endorsement');
  }
  return response.data.data!;
};

// Search skills
export const searchSkills = async (searchTerm: string, limit: number = 50): Promise<UserSkillWithUser[]> => {
  const response = await api.get<ApiResponse<UserSkillWithUser[]>>('/skills/search', {
    params: { q: searchTerm, limit }
  });
  return response.data.data || [];
};

// Get skill categories
export const getSkillCategories = async (): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>('/skills/categories');
  return response.data.data || [];
};

// Find users with matching skills
export const findMatchingUsers = async (skillNames: string[]): Promise<User[]> => {
  const response = await api.post<ApiResponse<User[]>>('/skills/find-matches', {
    skills: skillNames
  });
  return response.data.data || [];
};

// Utility functions for skill management
export const calculateSkillStrength = (skill: UserSkill): number => {
  let strength = skill.proficiencyLevel * 20; // Base: 20-100
  
  // Add points for experience
  strength += Math.min(skill.yearsExperience * 2, 20);
  
  // Add points for certifications
  if (skill.certifications && skill.certifications.length > 0) {
    strength += Math.min(skill.certifications.length * 5, 20);
  }
  
  // Add points for portfolio items
  if (skill.portfolioItems && skill.portfolioItems.length > 0) {
    strength += Math.min(skill.portfolioItems.length * 10, 30);
  }
  
  // Add points for endorsements
  if (skill.endorsedBy && skill.endorsedBy.length > 0) {
    strength += Math.min(skill.endorsedBy.length * 3, 30);
  }
  
  return Math.min(strength, 200); // Max 200 points
};

export const getSkillLevelColor = (proficiencyLevel: number): string => {
  switch (proficiencyLevel) {
    case 1: return 'bg-red-100 text-red-800';
    case 2: return 'bg-orange-100 text-orange-800';
    case 3: return 'bg-yellow-100 text-yellow-800';
    case 4: return 'bg-blue-100 text-blue-800';
    case 5: return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getSkillLevelBadge = (proficiencyLevel: number): string => {
  switch (proficiencyLevel) {
    case 1: return '⭐';
    case 2: return '⭐⭐';
    case 3: return '⭐⭐⭐';
    case 4: return '⭐⭐⭐⭐';
    case 5: return '⭐⭐⭐⭐⭐';
    default: return '';
  }
};

export const groupSkillsByCategory = (skills: UserSkill[]): Record<string, UserSkill[]> => {
  const categories: Record<string, UserSkill[]> = {};
  
  skills.forEach(skill => {
    // Simple categorization based on skill name
    let category = 'Other';
    
    const techSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'DevOps', 'Cybersecurity', 'Mobile Development', 'Blockchain'];
    const businessSkills = ['Product Management', 'Project Management', 'Business Development', 'Sales', 'Marketing', 'Digital Marketing', 'Content Marketing', 'SEO/SEM', 'Social Media', 'Customer Success', 'Operations', 'Finance', 'Accounting', 'Legal', 'HR', 'Strategy', 'Analytics'];
    const designSkills = ['UX/UI Design', 'Graphic Design', 'Copywriting'];
    const leadershipSkills = ['Team Leadership', 'Strategic Planning', 'Fundraising', 'Investor Relations', 'Public Speaking', 'Negotiation', 'Mentoring', 'Coaching'];
    
    if (techSkills.some(tech => skill.skillName.toLowerCase().includes(tech.toLowerCase()))) {
      category = 'Technical';
    } else if (businessSkills.some(business => skill.skillName.toLowerCase().includes(business.toLowerCase()))) {
      category = 'Business';
    } else if (designSkills.some(design => skill.skillName.toLowerCase().includes(design.toLowerCase()))) {
      category = 'Design';
    } else if (leadershipSkills.some(leadership => skill.skillName.toLowerCase().includes(leadership.toLowerCase()))) {
      category = 'Leadership';
    }
    
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(skill);
  });
  
  return categories;
};

// Skills validation
export const validateSkill = (skillData: CreateUserSkillDto): string[] => {
  const errors: string[] = [];
  
  if (!skillData.skillName || skillData.skillName.trim().length === 0) {
    errors.push('Skill name is required');
  }
  
  if (skillData.skillName && skillData.skillName.length > 100) {
    errors.push('Skill name must be less than 100 characters');
  }
  
  if (skillData.proficiencyLevel < 1 || skillData.proficiencyLevel > 5) {
    errors.push('Proficiency level must be between 1 and 5');
  }
  
  if (skillData.yearsExperience < 0 || skillData.yearsExperience > 50) {
    errors.push('Years of experience must be between 0 and 50');
  }
  
  return errors;
};
