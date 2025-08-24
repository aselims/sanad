import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Team, TeamStatus, TeamType } from '../entities/Team';
import { TeamMember, TeamMemberRole, MembershipStatus } from '../entities/TeamMember';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { UserSkill } from '../entities/UserSkill';

export class TeamController {
  private teamRepository = AppDataSource.getRepository(Team);
  private teamMemberRepository = AppDataSource.getRepository(TeamMember);
  private userRepository = AppDataSource.getRepository(User);
  private projectRepository = AppDataSource.getRepository(Project);
  private userSkillRepository = AppDataSource.getRepository(UserSkill);

  // Create team
  async createTeam(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const {
        name,
        description,
        type = TeamType.PROJECT_TEAM,
        projectId,
        maxMembers = 10,
        requiredSkills = [],
        preferredSkills = [],
        teamCharter,
        communicationGuidelines
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Team name is required'
        });
      }

      // Validate project if provided
      if (projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) {
          return res.status(400).json({
            success: false,
            error: 'Project not found'
          });
        }

        // Check if user has access to project
        const hasAccess = project.founderId === userId || 
                         project.teamLeadId === userId || 
                         project.coreTeamMembers?.includes(userId);

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to project'
          });
        }
      }

      const team = this.teamRepository.create({
        name,
        description,
        type,
        projectId,
        teamLeadId: userId,
        maxMembers,
        requiredSkills,
        preferredSkills,
        teamCharter,
        communicationGuidelines
      });

      const savedTeam = await this.teamRepository.save(team);

      // Add creator as team lead member
      const teamLeadMember = this.teamMemberRepository.create({
        teamId: savedTeam.id,
        userId,
        role: type === TeamType.CORE_TEAM ? TeamMemberRole.FOUNDER : TeamMemberRole.TEAM_LEAD,
        joinedAt: new Date()
      });

      await this.teamMemberRepository.save(teamLeadMember);

      // Load team with relations
      const teamWithRelations = await this.teamRepository.findOne({
        where: { id: savedTeam.id },
        relations: ['teamLead', 'project', 'members', 'members.user']
      });

      res.status(201).json({
        success: true,
        data: teamWithRelations
      });

    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create team'
      });
    }
  }

  // Get user's teams
  async getUserTeams(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { status, type, role, page = 1, limit = 10 } = req.query;

      let queryBuilder = this.teamRepository
        .createQueryBuilder('team')
        .leftJoinAndSelect('team.teamLead', 'teamLead')
        .leftJoinAndSelect('team.project', 'project')
        .leftJoinAndSelect('team.members', 'members')
        .leftJoinAndSelect('members.user', 'memberUser')
        .innerJoin('team.members', 'userMember')
        .where('userMember.userId = :userId', { userId });

      if (status) {
        queryBuilder.andWhere('team.status = :status', { status });
      }

      if (type) {
        queryBuilder.andWhere('team.type = :type', { type });
      }

      if (role) {
        queryBuilder.andWhere('userMember.role = :role', { role });
      }

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .orderBy('team.updatedAt', 'DESC')
        .skip(skip)
        .take(Number(limit));

      const [teams, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          teams,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user teams:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teams'
      });
    }
  }

  // Get team by ID
  async getTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const team = await this.teamRepository.findOne({
        where: { id },
        relations: ['teamLead', 'project', 'members', 'members.user', 'members.invitedBy']
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found'
        });
      }

      // Check if user is member of the team
      const isMember = team.members.some(member => member.userId === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: team
      });

    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team'
      });
    }
  }

  // Invite user to team
  async inviteToTeam(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const { userId: inviteUserId, role = TeamMemberRole.CONTRIBUTOR, message } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        relations: ['members']
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found'
        });
      }

      // Check if user can invite (team lead or founder)
      const userMember = team.members.find(member => member.userId === userId);
      if (!userMember || (userMember.role !== TeamMemberRole.TEAM_LEAD && userMember.role !== TeamMemberRole.FOUNDER)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to invite members'
        });
      }

      // Check if team has space
      if (team.currentMembersCount >= team.maxMembers) {
        return res.status(400).json({
          success: false,
          error: 'Team is at maximum capacity'
        });
      }

      // Check if user is already a member
      const existingMember = team.members.find(member => member.userId === inviteUserId);
      if (existingMember) {
        return res.status(400).json({
          success: false,
          error: 'User is already a team member'
        });
      }

      // Validate invite user exists
      const inviteUser = await this.userRepository.findOne({ where: { id: inviteUserId } });
      if (!inviteUser) {
        return res.status(400).json({
          success: false,
          error: 'User to invite not found'
        });
      }

      // Create team member with invited status
      const teamMember = this.teamMemberRepository.create({
        teamId,
        userId: inviteUserId,
        role,
        status: MembershipStatus.INVITED,
        joinedAt: new Date(),
        invitedById: userId
      });

      await this.teamMemberRepository.save(teamMember);

      // TODO: Send notification to invited user
      // This would integrate with the notification system

      const memberWithRelations = await this.teamMemberRepository.findOne({
        where: { id: teamMember.id },
        relations: ['user', 'team', 'invitedBy']
      });

      res.status(201).json({
        success: true,
        data: memberWithRelations,
        message: 'User invited to team successfully'
      });

    } catch (error) {
      console.error('Error inviting user to team:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to invite user to team'
      });
    }
  }

  // Respond to team invitation
  async respondToInvitation(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const { accept } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const teamMember = await this.teamMemberRepository.findOne({
        where: { teamId, userId, status: MembershipStatus.INVITED },
        relations: ['team']
      });

      if (!teamMember) {
        return res.status(404).json({
          success: false,
          error: 'Team invitation not found'
        });
      }

      if (accept) {
        teamMember.status = MembershipStatus.ACTIVE;
        await this.teamMemberRepository.save(teamMember);

        // Update team member count
        await this.teamRepository.update(teamId, {
          currentMembersCount: () => 'current_members_count + 1'
        });

        res.json({
          success: true,
          message: 'Team invitation accepted'
        });
      } else {
        await this.teamMemberRepository.delete(teamMember.id);

        res.json({
          success: true,
          message: 'Team invitation declined'
        });
      }

    } catch (error) {
      console.error('Error responding to team invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to respond to team invitation'
      });
    }
  }

  // Update team member
  async updateTeamMember(req: Request, res: Response) {
    try {
      const { teamId, memberId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        relations: ['members']
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permissions
      const userMember = team.members.find(member => member.userId === userId);
      if (!userMember || (userMember.role !== TeamMemberRole.TEAM_LEAD && userMember.role !== TeamMemberRole.FOUNDER)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      const updateData = req.body;
      await this.teamMemberRepository.update(memberId, updateData);

      const updatedMember = await this.teamMemberRepository.findOne({
        where: { id: memberId },
        relations: ['user', 'team']
      });

      res.json({
        success: true,
        data: updatedMember
      });

    } catch (error) {
      console.error('Error updating team member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update team member'
      });
    }
  }

  // Remove team member
  async removeTeamMember(req: Request, res: Response) {
    try {
      const { teamId, memberId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        relations: ['members']
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found'
        });
      }

      const memberToRemove = team.members.find(member => member.id === memberId);
      if (!memberToRemove) {
        return res.status(404).json({
          success: false,
          error: 'Team member not found'
        });
      }

      // Check permissions (team lead, founder, or the member themselves)
      const userMember = team.members.find(member => member.userId === userId);
      const canRemove = userMember && 
        (userMember.role === TeamMemberRole.TEAM_LEAD || 
         userMember.role === TeamMemberRole.FOUNDER ||
         memberToRemove.userId === userId);

      if (!canRemove) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      // Cannot remove the team lead
      if (memberToRemove.role === TeamMemberRole.TEAM_LEAD || memberToRemove.role === TeamMemberRole.FOUNDER) {
        return res.status(400).json({
          success: false,
          error: 'Cannot remove team lead or founder'
        });
      }

      await this.teamMemberRepository.delete(memberId);

      // Update team member count
      await this.teamRepository.update(teamId, {
        currentMembersCount: () => 'current_members_count - 1'
      });

      res.json({
        success: true,
        message: 'Team member removed successfully'
      });

    } catch (error) {
      console.error('Error removing team member:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove team member'
      });
    }
  }

  // Search for potential team members
  async searchPotentialMembers(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const { skills, location, availability, experienceLevel, page = 1, limit = 20 } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        relations: ['members']
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found'
        });
      }

      // Check if user is team member
      const isMember = team.members.some(member => member.userId === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      let queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.skills', 'userSkill')
        .where('user.id != :userId', { userId }); // Exclude current user

      // Exclude existing team members
      const existingMemberIds = team.members.map(member => member.userId);
      if (existingMemberIds.length > 0) {
        queryBuilder.andWhere('user.id NOT IN (:...memberIds)', { memberIds: existingMemberIds });
      }

      // Filter by skills if provided
      if (skills) {
        const skillArray = Array.isArray(skills) ? skills : [skills];
        queryBuilder.andWhere('userSkill.skillName IN (:...skills)', { skills: skillArray });
      }

      // Filter by location if provided
      if (location) {
        queryBuilder.andWhere('user.location ILIKE :location', { location: `%${location}%` });
      }

      // Filter by availability if provided
      if (availability) {
        queryBuilder.andWhere('user.availability = :availability', { availability });
      }

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .groupBy('user.id')
        .orderBy('COUNT(userSkill.id)', 'DESC') // Order by skill match count
        .skip(skip)
        .take(Number(limit));

      const [users, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error searching potential team members:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search potential team members'
      });
    }
  }

  // Get team statistics
  async getTeamStats(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const team = await this.teamRepository.findOne({
        where: { id: teamId },
        relations: ['members']
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found'
        });
      }

      const isMember = team.members.some(member => member.userId === userId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const totalMembers = team.members.length;
      const activeMembers = team.members.filter(member => member.status === MembershipStatus.ACTIVE).length;
      const invitedMembers = team.members.filter(member => member.status === MembershipStatus.INVITED).length;

      // Role distribution
      const roleDistribution = team.members.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        success: true,
        data: {
          totalMembers,
          activeMembers,
          invitedMembers,
          maxMembers: team.maxMembers,
          availableSlots: team.maxMembers - totalMembers,
          roleDistribution,
          teamStatus: team.status,
          teamType: team.type
        }
      });

    } catch (error) {
      console.error('Error fetching team stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch team statistics'
      });
    }
  }
}