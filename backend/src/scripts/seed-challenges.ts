import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Challenge, ChallengeType, ChallengeStatus } from '../entities/Challenge';
import logger from '../utils/logger';

// Sample challenges data
const challengeSeedData = [
  {
    title: 'Sustainable Water Management Solutions',
    description: 'Seeking innovative solutions for water conservation and management in urban areas of Saudi Arabia.',
    organization: 'Ministry of Environment, Water and Agriculture',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.OPEN,
    deadline: '2023-12-31',
    reward: 'SAR 500,000 grant funding',
    eligibilityCriteria: 'Open to startups, research institutions, and individuals with proven expertise in water management.',
  },
  {
    title: 'AI for Healthcare Diagnostics',
    description: 'Looking for AI-powered solutions to improve early diagnosis of chronic diseases in Saudi healthcare system.',
    organization: 'Ministry of Health',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.OPEN,
    deadline: '2023-11-30',
    reward: 'SAR 750,000 in funding and pilot implementation in 3 major hospitals',
    eligibilityCriteria: 'Open to AI startups and research teams with healthcare expertise.',
  },
  {
    title: 'Smart City Infrastructure',
    description: 'Seeking innovative IoT solutions for smart city infrastructure in NEOM.',
    organization: 'NEOM',
    type: ChallengeType.CORPORATE,
    status: ChallengeStatus.OPEN,
    deadline: '2024-01-15',
    reward: 'Implementation contract worth SAR 2,000,000',
    eligibilityCriteria: 'Open to technology companies with experience in smart city solutions.',
  },
  {
    title: 'Renewable Energy Storage Solutions',
    description: 'Looking for innovative energy storage technologies to complement solar power generation.',
    organization: 'Saudi Aramco',
    type: ChallengeType.CORPORATE,
    status: ChallengeStatus.IN_PROGRESS,
    deadline: '2023-10-15',
    reward: 'SAR 1,000,000 and potential commercial partnership',
    eligibilityCriteria: 'Open to startups and research institutions with proven energy storage technologies.',
  },
  {
    title: 'Educational Technology for Remote Learning',
    description: 'Seeking innovative EdTech solutions to enhance remote learning experiences for Saudi students.',
    organization: 'Ministry of Education',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.IN_PROGRESS,
    deadline: '2023-09-30',
    reward: 'SAR 500,000 and implementation in pilot schools',
    eligibilityCriteria: 'Open to EdTech startups and educational institutions.',
  },
  {
    title: 'Fintech Solutions for Financial Inclusion',
    description: 'Looking for innovative fintech solutions to increase financial inclusion in underserved communities.',
    organization: 'Saudi Central Bank',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.COMPLETED,
    deadline: '2023-06-30',
    reward: 'Regulatory sandbox access and SAR 300,000 grant',
    eligibilityCriteria: 'Open to fintech startups with solutions for financial inclusion.',
  },
];

// Function to seed challenges
const seedChallenges = async () => {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection established for seeding challenges');
    
    // Get repositories
    const challengeRepository = AppDataSource.getRepository(Challenge);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if challenges already exist
    const existingChallengesCount = await challengeRepository.count();
    
    if (existingChallengesCount === 0) {
      // Get admin user to be the creator
      const adminUser = await userRepository.findOne({ where: { email: 'admin@sanad.sa' } });
      
      if (!adminUser) {
        logger.error('Admin user not found. Please run seed-users.ts first.');
        process.exit(1);
      }
      
      // Create and save challenges
      for (const challengeData of challengeSeedData) {
        const challenge = new Challenge();
        challenge.title = challengeData.title;
        challenge.description = challengeData.description;
        challenge.organization = challengeData.organization;
        challenge.type = challengeData.type;
        challenge.status = challengeData.status;
        challenge.deadline = challengeData.deadline;
        challenge.reward = challengeData.reward;
        challenge.eligibilityCriteria = challengeData.eligibilityCriteria;
        challenge.createdById = adminUser.id;
        
        await challengeRepository.save(challenge);
        logger.info(`Created challenge: ${challengeData.title}`);
      }
      
      logger.info('Challenge seeding completed successfully');
    } else {
      logger.info('Challenges already exist, skipping challenge seeding');
    }
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding challenges: ${error}`);
    process.exit(1);
  }
};

// Run the seeding function
seedChallenges(); 