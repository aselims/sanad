import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Investment, InvestmentStatus, InvestmentType } from '../entities/Investment';
import { Investor } from '../entities/Investor';
import { Project } from '../entities/Project';
import { User } from '../entities/User';
import { In, Between } from 'typeorm';

export class InvestmentController {
  private investmentRepository = AppDataSource.getRepository(Investment);
  private investorRepository = AppDataSource.getRepository(Investor);
  private projectRepository = AppDataSource.getRepository(Project);
  private userRepository = AppDataSource.getRepository(User);

  // Express interest in a project
  async expressInterest(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { investorId, investmentType, amount, currency, notes } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Validate required fields
      if (!investorId || !investmentType || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Investor ID, investment type, and amount are required'
        });
      }

      // Validate investor and project exist
      const investor = await this.investorRepository.findOne({ where: { id: investorId } });
      const project = await this.projectRepository.findOne({ where: { id: projectId } });

      if (!investor) {
        return res.status(404).json({ success: false, error: 'Investor not found' });
      }

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      // Check if user has permission (investor owner or project owner)
      if (investor.userId !== userId && project.founderId !== userId && project.teamLeadId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      // Check if investment interest already exists
      const existingInvestment = await this.investmentRepository.findOne({
        where: { investorId, projectId }
      });

      if (existingInvestment) {
        return res.status(400).json({
          success: false,
          error: 'Investment interest already exists for this investor and project'
        });
      }

      // Create investment record
      const investment = this.investmentRepository.create({
        investorId,
        projectId,
        status: InvestmentStatus.INTERESTED,
        investmentType,
        amount,
        currency: currency || investor.currency,
        initialInterestDate: new Date(),
        leadSource: 'platform',
        notes
      });

      const savedInvestment = await this.investmentRepository.save(investment);

      // Load with relations
      const investmentWithRelations = await this.investmentRepository.findOne({
        where: { id: savedInvestment.id },
        relations: ['investor', 'project', 'introductionBy']
      });

      res.status(201).json({
        success: true,
        data: investmentWithRelations
      });

    } catch (error) {
      console.error('Error expressing investment interest:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to express investment interest'
      });
    }
  }

  // Get all investments with filtering
  async getInvestments(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const {
        status,
        investorId,
        projectId,
        investmentType,
        minAmount,
        maxAmount,
        currency,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20
      } = req.query;

      const queryBuilder = this.investmentRepository
        .createQueryBuilder('investment')
        .leftJoinAndSelect('investment.investor', 'investor')
        .leftJoinAndSelect('investment.project', 'project')
        .leftJoinAndSelect('investment.introductionBy', 'introductionBy')
        .leftJoinAndSelect('project.founder', 'founder');

      // User permissions - can see investments if they are:
      // 1. The investor
      // 2. The project founder/team lead
      // 3. An admin
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user?.role !== 'admin') {
        queryBuilder.where(
          '(investor.userId = :userId OR project.founderId = :userId OR project.teamLeadId = :userId)',
          { userId }
        );
      }

      // Apply filters
      if (status) {
        queryBuilder.andWhere('investment.status = :status', { status });
      }

      if (investorId) {
        queryBuilder.andWhere('investment.investorId = :investorId', { investorId });
      }

      if (projectId) {
        queryBuilder.andWhere('investment.projectId = :projectId', { projectId });
      }

      if (investmentType) {
        queryBuilder.andWhere('investment.investmentType = :investmentType', { investmentType });
      }

      if (minAmount) {
        queryBuilder.andWhere('investment.amount >= :minAmount', { minAmount });
      }

      if (maxAmount) {
        queryBuilder.andWhere('investment.amount <= :maxAmount', { maxAmount });
      }

      if (currency) {
        queryBuilder.andWhere('investment.currency = :currency', { currency });
      }

      if (dateFrom) {
        queryBuilder.andWhere('investment.createdAt >= :dateFrom', { dateFrom });
      }

      if (dateTo) {
        queryBuilder.andWhere('investment.createdAt <= :dateTo', { dateTo });
      }

      // Pagination
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder
        .orderBy('investment.createdAt', 'DESC')
        .skip(skip)
        .take(Number(limit));

      const [investments, total] = await queryBuilder.getManyAndCount();

      res.json({
        success: true,
        data: {
          investments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching investments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch investments'
      });
    }
  }

  // Get investment by ID
  async getInvestment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const investment = await this.investmentRepository.findOne({
        where: { id },
        relations: ['investor', 'project', 'introductionBy', 'project.founder']
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: 'Investment not found'
        });
      }

      // Check permissions
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const hasAccess = user?.role === 'admin' ||
                       investment.investor.userId === userId ||
                       investment.project.founderId === userId ||
                       investment.project.teamLeadId === userId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: investment
      });

    } catch (error) {
      console.error('Error fetching investment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch investment'
      });
    }
  }

  // Update investment status and details
  async updateInvestment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const investment = await this.investmentRepository.findOne({
        where: { id },
        relations: ['investor', 'project']
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: 'Investment not found'
        });
      }

      // Check permissions
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const canUpdate = user?.role === 'admin' ||
                       investment.investor.userId === userId ||
                       investment.project.founderId === userId ||
                       investment.project.teamLeadId === userId;

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      const updateData = { ...req.body };

      // Handle status changes with automatic date updates
      if (updateData.status && updateData.status !== investment.status) {
        const now = new Date();
        switch (updateData.status) {
          case InvestmentStatus.REVIEWING:
            if (!investment.dueDiligenceStartDate) {
              updateData.dueDiligenceStartDate = now;
            }
            break;
          case InvestmentStatus.DUE_DILIGENCE:
            if (!investment.dueDiligenceStartDate) {
              updateData.dueDiligenceStartDate = now;
            }
            break;
          case InvestmentStatus.TERM_SHEET:
            updateData.termSheetDate = now;
            break;
          case InvestmentStatus.CLOSED:
            updateData.closingDate = now;
            break;
          case InvestmentStatus.REJECTED:
            updateData.rejectionDate = now;
            break;
          case InvestmentStatus.WITHDRAWN:
            updateData.withdrawalDate = now;
            break;
        }
        updateData.lastContactDate = now;
      }

      await this.investmentRepository.update(id, updateData);

      const updatedInvestment = await this.investmentRepository.findOne({
        where: { id },
        relations: ['investor', 'project', 'introductionBy']
      });

      res.json({
        success: true,
        data: updatedInvestment
      });

    } catch (error) {
      console.error('Error updating investment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update investment'
      });
    }
  }

  // Add meeting or communication record
  async addMeetingRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { date, type, attendees, notes, outcome } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const investment = await this.investmentRepository.findOne({
        where: { id },
        relations: ['investor', 'project']
      });

      if (!investment) {
        return res.status(404).json({
          success: false,
          error: 'Investment not found'
        });
      }

      // Check permissions
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const canUpdate = user?.role === 'admin' ||
                       investment.investor.userId === userId ||
                       investment.project.founderId === userId ||
                       investment.project.teamLeadId === userId;

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      // Add to meeting history
      const meetingHistory = investment.meetingHistory || [];
      meetingHistory.push({
        date: new Date(date),
        type,
        attendees: attendees || [],
        notes: notes || '',
        outcome: outcome || ''
      });

      await this.investmentRepository.update(id, {
        meetingHistory,
        lastContactDate: new Date(date)
      });

      const updatedInvestment = await this.investmentRepository.findOne({
        where: { id },
        relations: ['investor', 'project', 'introductionBy']
      });

      res.json({
        success: true,
        data: updatedInvestment
      });

    } catch (error) {
      console.error('Error adding meeting record:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add meeting record'
      });
    }
  }

  // Get investment pipeline statistics
  async getInvestmentPipelineStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });

      let whereCondition = '';
      const params: any = { userId };

      // Filter based on user role
      if (user?.role !== 'admin') {
        whereCondition = 'WHERE (investor.user_id = :userId OR project.founder_id = :userId OR project.team_lead_id = :userId)';
      }

      // Status distribution
      const statusStats = await this.investmentRepository.query(`
        SELECT 
          investment.status,
          COUNT(*) as count,
          SUM(investment.amount) as totalAmount,
          AVG(investment.amount) as averageAmount
        FROM investments investment
        LEFT JOIN investors investor ON investment.investor_id = investor.id
        LEFT JOIN projects project ON investment.project_id = project.id
        ${whereCondition}
        GROUP BY investment.status
        ORDER BY 
          CASE investment.status
            WHEN 'interested' THEN 1
            WHEN 'reviewing' THEN 2
            WHEN 'due_diligence' THEN 3
            WHEN 'term_sheet' THEN 4
            WHEN 'negotiation' THEN 5
            WHEN 'closed' THEN 6
            WHEN 'rejected' THEN 7
            WHEN 'withdrawn' THEN 8
          END
      `, user?.role === 'admin' ? {} : params);

      // Monthly trends (last 12 months)
      const monthlyStats = await this.investmentRepository.query(`
        SELECT 
          DATE_TRUNC('month', investment.created_at) as month,
          COUNT(*) as newInvestments,
          COUNT(CASE WHEN investment.status = 'closed' THEN 1 END) as closedInvestments,
          SUM(investment.amount) as totalAmount
        FROM investments investment
        LEFT JOIN investors investor ON investment.investor_id = investor.id
        LEFT JOIN projects project ON investment.project_id = project.id
        ${whereCondition}
        AND investment.created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', investment.created_at)
        ORDER BY month DESC
      `, user?.role === 'admin' ? {} : params);

      // Investment type distribution
      const typeStats = await this.investmentRepository.query(`
        SELECT 
          investment.investment_type as type,
          COUNT(*) as count,
          SUM(investment.amount) as totalAmount
        FROM investments investment
        LEFT JOIN investors investor ON investment.investor_id = investor.id
        LEFT JOIN projects project ON investment.project_id = project.id
        ${whereCondition}
        GROUP BY investment.investment_type
      `, user?.role === 'admin' ? {} : params);

      // Performance metrics
      const performanceStats = await this.investmentRepository.query(`
        SELECT 
          COUNT(*) as totalInvestments,
          COUNT(CASE WHEN status = 'closed' THEN 1 END) as closedInvestments,
          COUNT(CASE WHEN status IN ('rejected', 'withdrawn') THEN 1 END) as failedInvestments,
          AVG(
            CASE 
              WHEN status = 'closed' AND closing_date IS NOT NULL 
              THEN EXTRACT(DAY FROM closing_date - created_at)
            END
          ) as averageTimeToClose,
          SUM(amount) as totalAmount,
          SUM(CASE WHEN status = 'closed' THEN amount ELSE 0 END) as closedAmount
        FROM investments investment
        LEFT JOIN investors investor ON investment.investor_id = investor.id
        LEFT JOIN projects project ON investment.project_id = project.id
        ${whereCondition}
      `, user?.role === 'admin' ? {} : params);

      const performance = performanceStats[0];
      const conversionRate = performance.totalInvestments > 0 
        ? Math.round((performance.closedInvestments / performance.totalInvestments) * 100) 
        : 0;

      res.json({
        success: true,
        data: {
          statusDistribution: statusStats.map((stat: any) => ({
            status: stat.status,
            count: parseInt(stat.count),
            totalAmount: parseFloat(stat.totalAmount) || 0,
            averageAmount: parseFloat(stat.averageAmount) || 0
          })),
          monthlyTrends: monthlyStats.map((stat: any) => ({
            month: stat.month,
            newInvestments: parseInt(stat.newInvestments),
            closedInvestments: parseInt(stat.closedInvestments),
            totalAmount: parseFloat(stat.totalAmount) || 0
          })),
          typeDistribution: typeStats.map((stat: any) => ({
            type: stat.type,
            count: parseInt(stat.count),
            totalAmount: parseFloat(stat.totalAmount) || 0
          })),
          performance: {
            totalInvestments: parseInt(performance.totalInvestments),
            closedInvestments: parseInt(performance.closedInvestments),
            failedInvestments: parseInt(performance.failedInvestments),
            conversionRate,
            averageTimeToClose: parseFloat(performance.averageTimeToClose) || 0,
            totalAmount: parseFloat(performance.totalAmount) || 0,
            closedAmount: parseFloat(performance.closedAmount) || 0
          }
        }
      });

    } catch (error) {
      console.error('Error fetching pipeline stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch investment pipeline statistics'
      });
    }
  }
}