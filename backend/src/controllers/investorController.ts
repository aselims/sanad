import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Investor, InvestorType, Currency } from '../entities/Investor';
import { Investment, InvestmentStatus, InvestmentType } from '../entities/Investment';
import { Project } from '../entities/Project';
import { User } from '../entities/User';
import { ILike, Between, In, MoreThan, LessThan } from 'typeorm';

export class InvestorController {
  private investorRepository = AppDataSource.getRepository(Investor);
  private investmentRepository = AppDataSource.getRepository(Investment);
  private projectRepository = AppDataSource.getRepository(Project);
  private userRepository = AppDataSource.getRepository(User);

  // Create new investor profile
  async createInvestor(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const {
        investorType,
        firmName,
        website,
        description,
        logo,
        contactEmail,
        contactPhone,
        contactPerson,
        country,
        city,
        timezone,
        focusAreas = [],
        stagePreference = [],
        geographicFocus = [],
        minInvestment,
        maxInvestment,
        currency = Currency.USD,
        industries = [],
        businessModels = [],
        investmentPhilosophy,
        portfolioSize = 0,
        activeInvestments = 0,
        averageTicketSize = 0,
        totalInvested = 0,
        notableExits = [],
        preferredContactMethod,
        availabilityHours = [],
        timeToDecisionWeeks,
        requiredDocuments = [],
        investmentCommittee = false,
        boardSeatRequired = false,
        notes,
      } = req.body;

      // Validate required fields
      if (!investorType || !firmName || !contactEmail || !minInvestment || !maxInvestment) {
        return res.status(400).json({
          success: false,
          error: 'Investor type, firm name, contact email, and investment range are required'
        });
      }

      // Check if investor profile already exists for this user
      const existingInvestor = await this.investorRepository.findOne({
        where: { userId }
      });

      if (existingInvestor) {
        return res.status(400).json({
          success: false,
          error: 'Investor profile already exists for this user'
        });
      }

      // Create investor profile
      const investor = this.investorRepository.create({
        userId,
        investorType,
        firmName,
        website,
        description,
        logo,
        contactEmail,
        contactPhone,
        contactPerson,
        country,
        city,
        timezone,
        focusAreas,
        stagePreference,
        geographicFocus,
        minInvestment,
        maxInvestment,
        currency,
        industries,
        businessModels,
        investmentPhilosophy,
        portfolioSize,
        activeInvestments,
        averageTicketSize,
        totalInvested,
        notableExits,
        preferredContactMethod,
        availabilityHours,
        timeToDecisionWeeks,
        requiredDocuments,
        investmentCommittee,
        boardSeatRequired,
        notes,
        lastActive: new Date(),
      });

      const savedInvestor = await this.investorRepository.save(investor);

      // Load with relations
      const investorWithRelations = await this.investorRepository.findOne({
        where: { id: savedInvestor.id },
        relations: ['user', 'verifiedBy']
      });

      res.status(201).json({
        success: true,
        data: investorWithRelations
      });

    } catch (error) {
      console.error('Error creating investor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create investor profile'
      });
    }
  }

  // Get all investors with filtering
  async getInvestors(req: Request, res: Response) {
    try {
      const {
        investorType,
        country,
        minAmount,
        maxAmount,
        currency,
        focusAreas,
        stagePreference,
        isVerified,
        acceptingPitches,
        page = 1,
        limit = 20,
        search
      } = req.query;

      const queryBuilder = this.investorRepository
        .createQueryBuilder('investor')
        .leftJoinAndSelect('investor.user', 'user')
        .leftJoinAndSelect('investor.verifiedBy', 'verifiedBy')
        .where('investor.active = :active', { active: true });

      // Apply filters
      if (investorType) {
        queryBuilder.andWhere('investor.investorType = :investorType', { investorType });
      }

      if (country) {
        queryBuilder.andWhere('investor.country = :country', { country });
      }

      if (minAmount) {
        queryBuilder.andWhere('investor.maxInvestment >= :minAmount', { minAmount });
      }

      if (maxAmount) {
        queryBuilder.andWhere('investor.minInvestment <= :maxAmount', { maxAmount });
      }

      if (currency) {
        queryBuilder.andWhere('investor.currency = :currency', { currency });
      }

      if (focusAreas) {
        const areas = Array.isArray(focusAreas) ? focusAreas : [focusAreas];
        queryBuilder.andWhere('investor.focusAreas && :focusAreas', { focusAreas: areas });
      }

      if (stagePreference) {
        const stages = Array.isArray(stagePreference) ? stagePreference : [stagePreference];
        queryBuilder.andWhere('investor.stagePreference && :stagePreference', { stagePreference: stages });
      }

      if (isVerified !== undefined) {
        queryBuilder.andWhere('investor.isVerified = :isVerified', { isVerified: isVerified === 'true' });
      }

      if (acceptingPitches !== undefined) {
        queryBuilder.andWhere('investor.acceptingPitches = :acceptingPitches', { acceptingPitches: acceptingPitches === 'true' });
      }

      if (search) {
        queryBuilder.andWhere(
          '(investor.firmName ILIKE :search OR investor.description ILIKE :search OR investor.investmentPhilosophy ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .orderBy('investor.isVerified', 'DESC')
        .addOrderBy('investor.responseRate', 'DESC')
        .addOrderBy('investor.lastActive', 'DESC')
        .skip(skip)
        .take(Number(limit));

      const [investors, total] = await queryBuilder.getManyAndCount();

      // Update profile views for displayed investors
      if (investors.length > 0) {
        await this.investorRepository.update(
          { id: In(investors.map(i => i.id)) },
          { profileViews: () => 'profile_views + 1' }
        );
      }

      res.json({
        success: true,
        data: {
          investors,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching investors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch investors'
      });
    }
  }

  // Get investor by ID
  async getInvestor(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const investor = await this.investorRepository.findOne({
        where: { id },
        relations: ['user', 'verifiedBy']
      });

      if (!investor) {
        return res.status(404).json({
          success: false,
          error: 'Investor not found'
        });
      }

      // Update profile views
      await this.investorRepository.update(id, {
        profileViews: investor.profileViews + 1
      });

      // Get investment statistics
      const investmentStats = await this.investmentRepository
        .createQueryBuilder('investment')
        .select([
          'COUNT(*) as totalInvestments',
          'COUNT(CASE WHEN status = :closed THEN 1 END) as closedInvestments',
          'AVG(amount) as averageAmount',
          'SUM(amount) as totalAmount'
        ])
        .where('investment.investorId = :investorId', { investorId: id })
        .setParameter('closed', InvestmentStatus.CLOSED)
        .getRawOne();

      res.json({
        success: true,
        data: {
          ...investor,
          stats: {
            totalInvestments: parseInt(investmentStats.totalInvestments) || 0,
            closedInvestments: parseInt(investmentStats.closedInvestments) || 0,
            averageAmount: parseFloat(investmentStats.averageAmount) || 0,
            totalAmount: parseFloat(investmentStats.totalAmount) || 0,
          }
        }
      });

    } catch (error) {
      console.error('Error fetching investor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch investor'
      });
    }
  }

  // Update investor profile
  async updateInvestor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const investor = await this.investorRepository.findOne({ where: { id } });
      if (!investor) {
        return res.status(404).json({
          success: false,
          error: 'Investor not found'
        });
      }

      // Check permissions (only owner or admin can update)
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (investor.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      const updateData = { ...req.body };
      updateData.lastActive = new Date();

      await this.investorRepository.update(id, updateData);

      const updatedInvestor = await this.investorRepository.findOne({
        where: { id },
        relations: ['user', 'verifiedBy']
      });

      res.json({
        success: true,
        data: updatedInvestor
      });

    } catch (error) {
      console.error('Error updating investor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update investor'
      });
    }
  }

  // Verify investor (admin only)
  async verifyInvestor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Check admin permissions
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      const investor = await this.investorRepository.findOne({ where: { id } });
      if (!investor) {
        return res.status(404).json({
          success: false,
          error: 'Investor not found'
        });
      }

      await this.investorRepository.update(id, {
        isVerified: true,
        verificationDate: new Date(),
        verifiedById: userId
      });

      const verifiedInvestor = await this.investorRepository.findOne({
        where: { id },
        relations: ['user', 'verifiedBy']
      });

      res.json({
        success: true,
        data: verifiedInvestor
      });

    } catch (error) {
      console.error('Error verifying investor:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify investor'
      });
    }
  }

  // Match investors to project
  async matchInvestorsToProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Get project details
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['sourceIdea']
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Check access permissions
      if (project.founderId !== userId && project.teamLeadId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Build matching query
      const queryBuilder = this.investorRepository
        .createQueryBuilder('investor')
        .leftJoinAndSelect('investor.user', 'user')
        .where('investor.active = :active', { active: true })
        .andWhere('investor.acceptingPitches = :accepting', { accepting: true })
        .andWhere('investor.isVerified = :verified', { verified: true });

      // Match by investment range (assuming project needs funding)
      if (project.fundingGoal) {
        queryBuilder.andWhere(
          '(investor.minInvestment <= :funding AND investor.maxInvestment >= :minFunding)',
          { funding: project.fundingGoal, minFunding: project.fundingGoal * 0.1 } // Accept 10% of funding goal as minimum
        );
      }

      // Match by stage
      if (project.stage) {
        queryBuilder.andWhere('investor.stagePreference && :stage', { stage: [project.stage] });
      }

      // Match by focus areas if available from source idea
      if (project.sourceIdea?.category) {
        queryBuilder.andWhere('investor.focusAreas && :focusAreas', { focusAreas: [project.sourceIdea.category] });
      }

      // Order by compatibility score (simplified)
      queryBuilder
        .orderBy('investor.responseRate', 'DESC')
        .addOrderBy('investor.investmentsMade', 'DESC')
        .addOrderBy('investor.lastActive', 'DESC')
        .limit(20);

      const matchingInvestors = await queryBuilder.getMany();

      res.json({
        success: true,
        data: {
          project: {
            id: project.id,
            name: project.name,
            stage: project.stage,
            fundingGoal: project.fundingGoal
          },
          matchingInvestors,
          matchingCriteria: {
            fundingRange: project.fundingGoal ? `$${project.fundingGoal.toLocaleString()}` : 'Not specified',
            stage: project.stage || 'Not specified',
            category: project.sourceIdea?.category || 'Not specified'
          }
        }
      });

    } catch (error) {
      console.error('Error matching investors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to match investors'
      });
    }
  }

  // Get investor statistics
  async getInvestorStats(req: Request, res: Response) {
    try {
      const totalInvestors = await this.investorRepository.count();
      const verifiedInvestors = await this.investorRepository.count({
        where: { isVerified: true }
      });
      const acceptingPitches = await this.investorRepository.count({
        where: { acceptingPitches: true, active: true }
      });

      // Investment statistics
      const investmentStats = await this.investmentRepository
        .createQueryBuilder('investment')
        .select([
          'COUNT(*) as totalInvestments',
          'COUNT(DISTINCT investor_id) as activeInvestors',
          'SUM(amount) as totalAmount',
          'AVG(amount) as averageAmount'
        ])
        .where('investment.status != :withdrawn', { withdrawn: InvestmentStatus.WITHDRAWN })
        .getRawOne();

      // By investor type
      const investorsByType = await this.investorRepository
        .createQueryBuilder('investor')
        .select('investor.investorType as type, COUNT(*) as count')
        .where('investor.active = :active', { active: true })
        .groupBy('investor.investorType')
        .getRawMany();

      // By currency
      const investorsByCurrency = await this.investorRepository
        .createQueryBuilder('investor')
        .select('investor.currency as currency, COUNT(*) as count')
        .where('investor.active = :active', { active: true })
        .groupBy('investor.currency')
        .getRawMany();

      res.json({
        success: true,
        data: {
          overview: {
            totalInvestors,
            verifiedInvestors,
            acceptingPitches,
            verificationRate: totalInvestors > 0 ? Math.round((verifiedInvestors / totalInvestors) * 100) : 0
          },
          investments: {
            totalInvestments: parseInt(investmentStats.totalInvestments) || 0,
            activeInvestors: parseInt(investmentStats.activeInvestors) || 0,
            totalAmount: parseFloat(investmentStats.totalAmount) || 0,
            averageAmount: parseFloat(investmentStats.averageAmount) || 0
          },
          distribution: {
            byType: investorsByType.map(item => ({
              type: item.type,
              count: parseInt(item.count)
            })),
            byCurrency: investorsByCurrency.map(item => ({
              currency: item.currency,
              count: parseInt(item.count)
            }))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching investor stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch investor statistics'
      });
    }
  }
}