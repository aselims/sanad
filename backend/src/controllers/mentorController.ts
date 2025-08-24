import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Mentor, MentorStatus, ExpertiseLevel } from '../entities/Mentor';
import { MentorSession, SessionStatus, SessionType } from '../entities/MentorSession';
import { User, UserRole } from '../entities/User';
import { Project } from '../entities/Project';

export class MentorController {
  private mentorRepository = AppDataSource.getRepository(Mentor);
  private sessionRepository = AppDataSource.getRepository(MentorSession);
  private userRepository = AppDataSource.getRepository(User);
  private projectRepository = AppDataSource.getRepository(Project);

  // Create mentor profile
  async createMentorProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const {
        companyName,
        jobTitle,
        yearsOfExperience,
        expertiseLevel = ExpertiseLevel.SENIOR,
        industryFocus = [],
        functionalExpertise = [],
        stagePreference = [],
        maxMentees = 5,
        hoursPerWeek,
        sessionDurationMinutes = 60,
        isPaidMentoring = false,
        hourlyRate,
        availableDays = [],
        timezone = 'UTC',
        availableTimeSlots = [],
        bio,
        mentoringPhilosophy,
        linkedinUrl,
        websiteUrl
      } = req.body;

      // Validate required fields
      if (!yearsOfExperience || industryFocus.length === 0 || functionalExpertise.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Years of experience, industry focus, and functional expertise are required'
        });
      }

      // Check if mentor profile already exists
      const existingMentor = await this.mentorRepository.findOne({ where: { userId } });
      if (existingMentor) {
        return res.status(400).json({
          success: false,
          error: 'Mentor profile already exists'
        });
      }

      const mentor = this.mentorRepository.create({
        userId,
        companyName,
        jobTitle,
        yearsOfExperience,
        expertiseLevel,
        industryFocus,
        functionalExpertise,
        stagePreference,
        maxMentees,
        hoursPerWeek,
        sessionDurationMinutes,
        isPaidMentoring,
        hourlyRate: isPaidMentoring ? hourlyRate : null,
        availableDays,
        timezone,
        availableTimeSlots,
        bio,
        mentoringPhilosophy,
        linkedinUrl,
        websiteUrl
      });

      const savedMentor = await this.mentorRepository.save(mentor);

      const mentorWithUser = await this.mentorRepository.findOne({
        where: { id: savedMentor.id },
        relations: ['user']
      });

      res.status(201).json({
        success: true,
        data: mentorWithUser
      });

    } catch (error) {
      console.error('Error creating mentor profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create mentor profile'
      });
    }
  }

  // Update mentor profile
  async updateMentorProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const mentor = await this.mentorRepository.findOne({ where: { id } });
      if (!mentor) {
        return res.status(404).json({
          success: false,
          error: 'Mentor profile not found'
        });
      }

      if (mentor.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updateData = { ...req.body };
      
      // If changing to paid mentoring, ensure hourly rate is provided
      if (updateData.isPaidMentoring && !updateData.hourlyRate) {
        return res.status(400).json({
          success: false,
          error: 'Hourly rate is required for paid mentoring'
        });
      }

      await this.mentorRepository.update(id, updateData);

      const updatedMentor = await this.mentorRepository.findOne({
        where: { id },
        relations: ['user']
      });

      res.json({
        success: true,
        data: updatedMentor
      });

    } catch (error) {
      console.error('Error updating mentor profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update mentor profile'
      });
    }
  }

  // Get mentor profile
  async getMentorProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const mentor = await this.mentorRepository.findOne({
        where: { id },
        relations: ['user', 'sessions']
      });

      if (!mentor) {
        return res.status(404).json({
          success: false,
          error: 'Mentor not found'
        });
      }

      res.json({
        success: true,
        data: mentor
      });

    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch mentor profile'
      });
    }
  }

  // Search mentors
  async searchMentors(req: Request, res: Response) {
    try {
      const {
        industryFocus,
        functionalExpertise,
        stagePreference,
        expertiseLevel,
        isPaidMentoring,
        maxHourlyRate,
        availableDays,
        timezone,
        isVerified,
        page = 1,
        limit = 20
      } = req.query;

      const queryBuilder = this.mentorRepository
        .createQueryBuilder('mentor')
        .leftJoinAndSelect('mentor.user', 'user')
        .where('mentor.status = :status', { status: MentorStatus.ACTIVE })
        .andWhere('mentor.currentMentees < mentor.maxMentees');

      if (industryFocus) {
        const industries = Array.isArray(industryFocus) ? industryFocus : [industryFocus];
        queryBuilder.andWhere('mentor.industryFocus && :industries', { industries });
      }

      if (functionalExpertise) {
        const expertise = Array.isArray(functionalExpertise) ? functionalExpertise : [functionalExpertise];
        queryBuilder.andWhere('mentor.functionalExpertise && :expertise', { expertise });
      }

      if (stagePreference) {
        const stages = Array.isArray(stagePreference) ? stagePreference : [stagePreference];
        queryBuilder.andWhere('mentor.stagePreference && :stages', { stages });
      }

      if (expertiseLevel) {
        queryBuilder.andWhere('mentor.expertiseLevel = :expertiseLevel', { expertiseLevel });
      }

      if (isPaidMentoring !== undefined) {
        queryBuilder.andWhere('mentor.isPaidMentoring = :isPaidMentoring', { 
          isPaidMentoring: isPaidMentoring === 'true' 
        });
      }

      if (maxHourlyRate && isPaidMentoring === 'true') {
        queryBuilder.andWhere('mentor.hourlyRate <= :maxHourlyRate', { maxHourlyRate });
      }

      if (availableDays) {
        const days = Array.isArray(availableDays) ? availableDays : [availableDays];
        queryBuilder.andWhere('mentor.availableDays && :days', { days });
      }

      if (timezone) {
        queryBuilder.andWhere('mentor.timezone = :timezone', { timezone });
      }

      if (isVerified !== undefined) {
        queryBuilder.andWhere('mentor.isVerified = :isVerified', { 
          isVerified: isVerified === 'true' 
        });
      }

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .orderBy('mentor.averageRating', 'DESC')
        .addOrderBy('mentor.totalSessions', 'DESC')
        .skip(skip)
        .take(Number(limit));

      const [mentors, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          mentors,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error searching mentors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search mentors'
      });
    }
  }

  // Request mentoring session
  async requestSession(req: Request, res: Response) {
    try {
      const { mentorId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const {
        projectId,
        type = SessionType.INITIAL_CONSULTATION,
        scheduledAt,
        durationMinutes,
        description,
        objectives = []
      } = req.body;

      if (!scheduledAt || !description) {
        return res.status(400).json({
          success: false,
          error: 'Scheduled time and description are required'
        });
      }

      const mentor = await this.mentorRepository.findOne({ where: { id: mentorId } });
      if (!mentor) {
        return res.status(404).json({
          success: false,
          error: 'Mentor not found'
        });
      }

      if (mentor.status !== MentorStatus.ACTIVE || mentor.currentMentees >= mentor.maxMentees) {
        return res.status(400).json({
          success: false,
          error: 'Mentor is not available for new sessions'
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

      const session = this.sessionRepository.create({
        mentorId,
        menteeId: userId,
        projectId,
        type,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes || mentor.sessionDurationMinutes,
        description,
        objectives,
        isPaid: mentor.isPaidMentoring,
        amount: mentor.isPaidMentoring ? mentor.hourlyRate : null
      });

      const savedSession = await this.sessionRepository.save(session);

      const sessionWithRelations = await this.sessionRepository.findOne({
        where: { id: savedSession.id },
        relations: ['mentor', 'mentor.user', 'mentee', 'project']
      });

      res.status(201).json({
        success: true,
        data: sessionWithRelations
      });

    } catch (error) {
      console.error('Error requesting mentoring session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to request mentoring session'
      });
    }
  }

  // Respond to session request (mentor)
  async respondToSessionRequest(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { accept, rejectionReason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const session = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['mentor']
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      if (session.mentor.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      if (session.status !== SessionStatus.REQUESTED) {
        return res.status(400).json({
          success: false,
          error: 'Session request already processed'
        });
      }

      if (accept) {
        session.status = SessionStatus.ACCEPTED;
        
        // Update mentor's current mentee count if this is their first session with this mentee
        const existingSessions = await this.sessionRepository.count({
          where: { mentorId: session.mentorId, menteeId: session.menteeId }
        });

        if (existingSessions === 1) { // This is the first session
          await this.mentorRepository.update(session.mentorId, {
            currentMentees: () => 'current_mentees + 1'
          });
        }
      } else {
        session.status = SessionStatus.CANCELLED;
        if (rejectionReason) {
          session.sessionNotes = `Rejected: ${rejectionReason}`;
        }
      }

      await this.sessionRepository.save(session);

      const updatedSession = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['mentor', 'mentor.user', 'mentee', 'project']
      });

      res.json({
        success: true,
        data: updatedSession
      });

    } catch (error) {
      console.error('Error responding to session request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to respond to session request'
      });
    }
  }

  // Get user's mentoring sessions
  async getUserSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { role, status, upcoming, page = 1, limit = 20 } = req.query;

      let queryBuilder = this.sessionRepository
        .createQueryBuilder('session')
        .leftJoinAndSelect('session.mentor', 'mentor')
        .leftJoinAndSelect('mentor.user', 'mentorUser')
        .leftJoinAndSelect('session.mentee', 'mentee')
        .leftJoinAndSelect('session.project', 'project');

      if (role === 'mentor') {
        queryBuilder.andWhere('mentor.userId = :userId', { userId });
      } else if (role === 'mentee') {
        queryBuilder.andWhere('session.menteeId = :userId', { userId });
      } else {
        // Show sessions where user is either mentor or mentee
        queryBuilder.andWhere('(mentor.userId = :userId OR session.menteeId = :userId)', { userId });
      }

      if (status) {
        queryBuilder.andWhere('session.status = :status', { status });
      }

      if (upcoming === 'true') {
        queryBuilder.andWhere('session.scheduledAt > :now', { now: new Date() });
      }

      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .orderBy('session.scheduledAt', 'DESC')
        .skip(skip)
        .take(Number(limit));

      const [sessions, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          sessions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions'
      });
    }
  }

  // Update session (start, end, add notes)
  async updateSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const session = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['mentor']
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      // Check if user is participant
      const isParticipant = session.mentor.userId === userId || session.menteeId === userId;
      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updateData = { ...req.body };

      // Handle status changes
      if (updateData.status === SessionStatus.IN_PROGRESS && !session.startedAt) {
        updateData.startedAt = new Date();
      }

      if (updateData.status === SessionStatus.COMPLETED && !session.endedAt) {
        updateData.endedAt = new Date();
        
        // Update mentor statistics
        await this.mentorRepository.update(session.mentorId, {
          totalSessions: () => 'total_sessions + 1'
        });
      }

      await this.sessionRepository.update(sessionId, updateData);

      const updatedSession = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['mentor', 'mentor.user', 'mentee', 'project']
      });

      res.json({
        success: true,
        data: updatedSession
      });

    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update session'
      });
    }
  }

  // Rate session (feedback)
  async rateSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { rating, feedback, role } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      const session = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['mentor']
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      const updateData: any = {};

      if (role === 'mentor' && session.mentor.userId === userId) {
        updateData.mentorRating = rating;
        updateData.mentorFeedback = feedback;
      } else if (role === 'mentee' && session.menteeId === userId) {
        updateData.menteeRating = rating;
        updateData.menteeFeedback = feedback;
        
        // Update mentor's average rating
        const mentorSessions = await this.sessionRepository.find({
          where: { mentorId: session.mentorId, menteeRating: /* NOT NULL */ undefined },
          select: ['menteeRating']
        });

        const totalRatings = mentorSessions.length + 1;
        const totalScore = mentorSessions.reduce((sum, s) => sum + (s.menteeRating || 0), 0) + rating;
        const newAverageRating = totalScore / totalRatings;

        await this.mentorRepository.update(session.mentorId, {
          averageRating: Math.round(newAverageRating * 100) / 100,
          totalReviews: totalRatings
        });
      } else {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await this.sessionRepository.update(sessionId, updateData);

      const updatedSession = await this.sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['mentor', 'mentor.user', 'mentee', 'project']
      });

      res.json({
        success: true,
        data: updatedSession
      });

    } catch (error) {
      console.error('Error rating session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to rate session'
      });
    }
  }

  // Get mentor statistics
  async getMentorStats(req: Request, res: Response) {
    try {
      const { mentorId } = req.params;

      const mentor = await this.mentorRepository.findOne({
        where: { id: mentorId },
        relations: ['sessions']
      });

      if (!mentor) {
        return res.status(404).json({
          success: false,
          error: 'Mentor not found'
        });
      }

      const totalSessions = mentor.sessions.length;
      const completedSessions = mentor.sessions.filter(s => s.status === SessionStatus.COMPLETED).length;
      const upcomingSessions = mentor.sessions.filter(s => 
        s.scheduledAt > new Date() && [SessionStatus.ACCEPTED, SessionStatus.CONFIRMED].includes(s.status)
      ).length;

      const sessionTypes = mentor.sessions.reduce((acc, session) => {
        acc[session.type] = (acc[session.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        success: true,
        data: {
          totalSessions: mentor.totalSessions,
          completedSessions,
          upcomingSessions,
          currentMentees: mentor.currentMentees,
          maxMentees: mentor.maxMentees,
          averageRating: mentor.averageRating,
          totalReviews: mentor.totalReviews,
          sessionTypes,
          responseTimeHours: mentor.responseTimeHours
        }
      });

    } catch (error) {
      console.error('Error fetching mentor stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch mentor statistics'
      });
    }
  }
}