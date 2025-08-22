import {
  calculateSkillStrength,
  getSkillLevelColor,
  getSkillLevelBadge,
  groupSkillsByCategory,
  validateSkill
} from '../skills';
import { UserSkill, CreateUserSkillDto } from '../../types/user';

// Mock skill data for testing
const mockSkill: UserSkill = {
  id: '1',
  userId: 'user1',
  skillName: 'React',
  proficiencyLevel: 4,
  yearsExperience: 3,
  certifications: ['React Certification'],
  portfolioItems: [
    {
      title: 'E-commerce App',
      description: 'Full-stack React application',
      url: 'https://example.com',
      technologies: ['React', 'Node.js'],
      screenshots: []
    }
  ],
  endorsedBy: ['user2', 'user3'],
  isHighlighted: true,
  isVisible: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastUpdated: new Date()
};

const mockSkills: UserSkill[] = [
  {
    ...mockSkill,
    skillName: 'JavaScript',
    proficiencyLevel: 5
  },
  {
    ...mockSkill,
    id: '2',
    skillName: 'Python',
    proficiencyLevel: 3
  },
  {
    ...mockSkill,
    id: '3',
    skillName: 'Project Management',
    proficiencyLevel: 4
  },
  {
    ...mockSkill,
    id: '4',
    skillName: 'UX Design',
    proficiencyLevel: 2
  }
];

describe('Skills Service Utilities', () => {
  describe('calculateSkillStrength', () => {
    it('should calculate skill strength correctly', () => {
      const strength = calculateSkillStrength(mockSkill);
      
      // Base: 4 * 20 = 80
      // Experience: 3 * 2 = 6
      // Certifications: 1 * 5 = 5
      // Portfolio: 1 * 10 = 10
      // Endorsements: 2 * 3 = 6
      // Total: 107
      expect(strength).toBe(107);
    });

    it('should cap skill strength at 200', () => {
      const maxSkill: UserSkill = {
        ...mockSkill,
        proficiencyLevel: 5,
        yearsExperience: 20,
        certifications: Array(10).fill('cert'),
        portfolioItems: Array(5).fill(mockSkill.portfolioItems![0]),
        endorsedBy: Array(20).fill('user')
      };

      const strength = calculateSkillStrength(maxSkill);
      expect(strength).toBe(200);
    });

    it('should handle missing optional fields', () => {
      const minimalSkill: UserSkill = {
        ...mockSkill,
        certifications: undefined,
        portfolioItems: undefined,
        endorsedBy: []
      };

      const strength = calculateSkillStrength(minimalSkill);
      expect(strength).toBeGreaterThan(0);
    });
  });

  describe('getSkillLevelColor', () => {
    it('should return correct colors for each proficiency level', () => {
      expect(getSkillLevelColor(1)).toBe('bg-red-100 text-red-800');
      expect(getSkillLevelColor(2)).toBe('bg-orange-100 text-orange-800');
      expect(getSkillLevelColor(3)).toBe('bg-yellow-100 text-yellow-800');
      expect(getSkillLevelColor(4)).toBe('bg-blue-100 text-blue-800');
      expect(getSkillLevelColor(5)).toBe('bg-green-100 text-green-800');
      expect(getSkillLevelColor(0)).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getSkillLevelBadge', () => {
    it('should return correct star badges for each level', () => {
      expect(getSkillLevelBadge(1)).toBe('⭐');
      expect(getSkillLevelBadge(2)).toBe('⭐⭐');
      expect(getSkillLevelBadge(3)).toBe('⭐⭐⭐');
      expect(getSkillLevelBadge(4)).toBe('⭐⭐⭐⭐');
      expect(getSkillLevelBadge(5)).toBe('⭐⭐⭐⭐⭐');
      expect(getSkillLevelBadge(0)).toBe('');
    });
  });

  describe('groupSkillsByCategory', () => {
    it('should categorize skills correctly', () => {
      const grouped = groupSkillsByCategory(mockSkills);

      expect(grouped['Technical']).toContainEqual(
        expect.objectContaining({ skillName: 'JavaScript' })
      );
      expect(grouped['Technical']).toContainEqual(
        expect.objectContaining({ skillName: 'Python' })
      );
      expect(grouped['Business']).toContainEqual(
        expect.objectContaining({ skillName: 'Project Management' })
      );
      expect(grouped['Design']).toContainEqual(
        expect.objectContaining({ skillName: 'UX Design' })
      );
    });

    it('should handle empty skills array', () => {
      const grouped = groupSkillsByCategory([]);
      expect(Object.keys(grouped)).toHaveLength(0);
    });

    it('should categorize unknown skills as Other', () => {
      const unknownSkill: UserSkill = {
        ...mockSkill,
        skillName: 'Underwater Basket Weaving'
      };
      
      const grouped = groupSkillsByCategory([unknownSkill]);
      expect(grouped['Other']).toContainEqual(unknownSkill);
    });
  });

  describe('validateSkill', () => {
    const validSkillData: CreateUserSkillDto = {
      skillName: 'React',
      proficiencyLevel: 3,
      yearsExperience: 2,
      certifications: ['React Certification'],
      portfolioItems: [],
      isHighlighted: false
    };

    it('should validate correct skill data', () => {
      const errors = validateSkill(validSkillData);
      expect(errors).toHaveLength(0);
    });

    it('should require skill name', () => {
      const invalidSkill = { ...validSkillData, skillName: '' };
      const errors = validateSkill(invalidSkill);
      expect(errors).toContain('Skill name is required');
    });

    it('should validate skill name length', () => {
      const invalidSkill = { 
        ...validSkillData, 
        skillName: 'x'.repeat(101) 
      };
      const errors = validateSkill(invalidSkill);
      expect(errors).toContain('Skill name must be less than 100 characters');
    });

    it('should validate proficiency level range', () => {
      const invalidSkill1 = { ...validSkillData, proficiencyLevel: 0 };
      const invalidSkill2 = { ...validSkillData, proficiencyLevel: 6 };
      
      const errors1 = validateSkill(invalidSkill1);
      const errors2 = validateSkill(invalidSkill2);
      
      expect(errors1).toContain('Proficiency level must be between 1 and 5');
      expect(errors2).toContain('Proficiency level must be between 1 and 5');
    });

    it('should validate years of experience range', () => {
      const invalidSkill1 = { ...validSkillData, yearsExperience: -1 };
      const invalidSkill2 = { ...validSkillData, yearsExperience: 51 };
      
      const errors1 = validateSkill(invalidSkill1);
      const errors2 = validateSkill(invalidSkill2);
      
      expect(errors1).toContain('Years of experience must be between 0 and 50');
      expect(errors2).toContain('Years of experience must be between 0 and 50');
    });

    it('should return multiple errors for multiple validation failures', () => {
      const invalidSkill: CreateUserSkillDto = {
        skillName: '',
        proficiencyLevel: 0,
        yearsExperience: -1,
        certifications: [],
        portfolioItems: [],
        isHighlighted: false
      };
      
      const errors = validateSkill(invalidSkill);
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});
