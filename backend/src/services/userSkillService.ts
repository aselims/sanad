import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { UserSkill } from '../entities/UserSkill';
import { User } from '../entities/User';

export interface CreateUserSkillDto {
  skillName: string;
  proficiencyLevel: number;
  yearsExperience: number;
  certifications?: string[];
  portfolioItems?: {
    title: string;
    description: string;
    url?: string;
    technologies?: string[];
    screenshots?: string[];
  }[];
  isHighlighted?: boolean;
}

export interface UpdateUserSkillDto extends Partial<CreateUserSkillDto> {
  isVisible?: boolean;
}

export interface SkillEndorsementDto {
  skillId: string;
  endorserId: string;
}

export class UserSkillService {
  private userSkillRepository: Repository<UserSkill>;
  private userRepository: Repository<User>;

  constructor() {
    this.userSkillRepository = AppDataSource.getRepository(UserSkill);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createSkill(userId: string, skillData: CreateUserSkillDto): Promise<UserSkill> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if skill already exists for this user
    const existingSkill = await this.userSkillRepository.findOne({
      where: { userId, skillName: skillData.skillName },
    });

    if (existingSkill) {
      throw new Error('Skill already exists for this user');
    }

    const skill = this.userSkillRepository.create({
      userId,
      ...skillData,
      endorsedBy: [],
    });

    const savedSkill = await this.userSkillRepository.save(skill);
    
    // Update user's profile completion
    await this.updateProfileCompletion(userId);

    return savedSkill;
  }

  async updateSkill(skillId: string, userId: string, skillData: UpdateUserSkillDto): Promise<UserSkill> {
    const skill = await this.userSkillRepository.findOne({
      where: { id: skillId, userId },
    });

    if (!skill) {
      throw new Error('Skill not found or not owned by user');
    }

    Object.assign(skill, skillData);
    skill.lastUpdated = new Date();

    return await this.userSkillRepository.save(skill);
  }

  async deleteSkill(skillId: string, userId: string): Promise<void> {
    const result = await this.userSkillRepository.delete({
      id: skillId,
      userId,
    });

    if (result.affected === 0) {
      throw new Error('Skill not found or not owned by user');
    }

    // Update user's profile completion
    await this.updateProfileCompletion(userId);
  }

  async getUserSkills(userId: string, includeHidden: boolean = false): Promise<UserSkill[]> {
    const whereCondition: any = { userId };
    if (!includeHidden) {
      whereCondition.isVisible = true;
    }

    return await this.userSkillRepository.find({
      where: whereCondition,
      order: { isHighlighted: 'DESC', proficiencyLevel: 'DESC', createdAt: 'ASC' },
    });
  }

  async endorseSkill(skillId: string, endorserId: string): Promise<UserSkill> {
    const skill = await this.userSkillRepository.findOne({
      where: { id: skillId },
      relations: ['user'],
    });

    if (!skill) {
      throw new Error('Skill not found');
    }

    if (skill.userId === endorserId) {
      throw new Error('Cannot endorse your own skill');
    }

    if (skill.endorsedBy.includes(endorserId)) {
      throw new Error('Already endorsed this skill');
    }

    skill.endorsedBy.push(endorserId);
    const updatedSkill = await this.userSkillRepository.save(skill);

    // Update endorsement counts
    await this.updateEndorsementCounts(skill.userId, endorserId);

    return updatedSkill;
  }

  async removeEndorsement(skillId: string, endorserId: string): Promise<UserSkill> {
    const skill = await this.userSkillRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new Error('Skill not found');
    }

    const endorsementIndex = skill.endorsedBy.indexOf(endorserId);
    if (endorsementIndex === -1) {
      throw new Error('Endorsement not found');
    }

    skill.endorsedBy.splice(endorsementIndex, 1);
    const updatedSkill = await this.userSkillRepository.save(skill);

    // Update endorsement counts
    await this.updateEndorsementCounts(skill.userId, endorserId, false);

    return updatedSkill;
  }

  async searchSkills(searchTerm: string, limit: number = 50): Promise<UserSkill[]> {
    return await this.userSkillRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.user', 'user')
      .where('skill.skillName ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('skill.isVisible = true')
      .orderBy('skill.proficiencyLevel', 'DESC')
      .addOrderBy('skill.yearsExperience', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getSkillCategories(): Promise<string[]> {
    const skills = await this.userSkillRepository
      .createQueryBuilder('skill')
      .select('DISTINCT skill.skillName', 'skillName')
      .where('skill.isVisible = true')
      .getRawMany();

    return skills.map(s => s.skillName).sort();
  }

  async findMatchingSkills(userId: string, requiredSkills: string[]): Promise<User[]> {
    if (requiredSkills.length === 0) {
      return [];
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.skills', 'skill')
      .where('skill.skillName IN (:...skillNames)', { skillNames: requiredSkills })
      .andWhere('skill.isVisible = true')
      .andWhere('user.id != :userId', { userId })
      .andWhere('user.isActive = true')
      .getMany();

    // Sort by number of matching skills and proficiency
    return users.sort((a, b) => {
      const aMatchingSkills = a.skills.filter(s => requiredSkills.includes(s.skillName));
      const bMatchingSkills = b.skills.filter(s => requiredSkills.includes(s.skillName));
      
      if (aMatchingSkills.length !== bMatchingSkills.length) {
        return bMatchingSkills.length - aMatchingSkills.length;
      }
      
      const aAvgProficiency = aMatchingSkills.reduce((sum, s) => sum + s.proficiencyLevel, 0) / aMatchingSkills.length;
      const bAvgProficiency = bMatchingSkills.reduce((sum, s) => sum + s.proficiencyLevel, 0) / bMatchingSkills.length;
      
      return bAvgProficiency - aAvgProficiency;
    });
  }

  private async updateProfileCompletion(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['skills'],
    });

    if (!user) return;

    let completionScore = 30; // Base score for having an account

    // Profile fields (40 points total)
    if (user.firstName && user.lastName) completionScore += 5;
    if (user.bio) completionScore += 5;
    if (user.location) completionScore += 5;
    if (user.position) completionScore += 5;
    if (user.organization) completionScore += 5;
    if (user.profilePicture) completionScore += 10;
    if (user.interests && user.interests.length > 0) completionScore += 5;

    // Skills (20 points total)
    if (user.skills && user.skills.length > 0) completionScore += 10;
    if (user.skills && user.skills.length >= 3) completionScore += 10;

    // Professional links (10 points total)
    if (user.linkedinUrl) completionScore += 5;
    if (user.githubUrl || user.websiteUrl || user.portfolioUrl) completionScore += 5;

    const wasCompleted = user.profileCompleted;
    user.profileCompletionPercentage = Math.min(completionScore, 100);
    user.profileCompleted = completionScore >= 80;
    
    if (!wasCompleted && user.profileCompleted) {
      user.profileCompletedAt = new Date();
    }

    await this.userRepository.save(user);
  }

  private async updateEndorsementCounts(skillOwnerId: string, endorserId: string, isEndorsing: boolean = true): Promise<void> {
    const skillOwner = await this.userRepository.findOne({ where: { id: skillOwnerId } });
    const endorser = await this.userRepository.findOne({ where: { id: endorserId } });

    if (skillOwner) {
      skillOwner.endorsementsReceived += isEndorsing ? 1 : -1;
      await this.userRepository.save(skillOwner);
    }

    if (endorser) {
      endorser.endorsementsGiven += isEndorsing ? 1 : -1;
      await this.userRepository.save(endorser);
    }
  }
}
