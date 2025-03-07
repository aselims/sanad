import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { Challenge, ChallengeType, ChallengeStatus } from '../entities/Challenge';
import { Partnership, PartnershipStatus } from '../entities/Partnership';
import { INNOVATOR_TYPES, ALL_ROLES } from '../constants/roles';
import * as bcrypt from 'bcrypt';
import logger from '../utils/logger';

// Sample data for each innovator type
const innovatorSeedData = [
  // Startup innovators
  {
    firstName: 'Ahmed',
    lastName: 'Al-Farsi',
    email: 'ahmed@techstartup.sa',
    password: 'Password123!',
    role: UserRole.STARTUP,
    organization: 'EcoTech Solutions',
    position: 'Founder & CEO',
    bio: 'Leading a startup focused on sustainable technology solutions for urban environments in Saudi Arabia.',
  },
  {
    firstName: 'Fatima',
    lastName: 'Al-Zahrani',
    email: 'fatima@aihealth.sa',
    password: 'Password123!',
    role: UserRole.STARTUP,
    organization: 'AI Health Innovations',
    position: 'Co-founder & CTO',
    bio: 'Developing AI-powered healthcare solutions to improve patient outcomes and medical efficiency.',
  },
  
  // Research innovators
  {
    firstName: 'Dr. Mohammed',
    lastName: 'Al-Qahtani',
    email: 'mohammed@kaust.edu.sa',
    password: 'Password123!',
    role: UserRole.RESEARCH,
    organization: 'King Abdullah University of Science and Technology',
    position: 'Research Director',
    bio: 'Leading research in renewable energy technologies with a focus on solar applications in desert environments.',
  },
  {
    firstName: 'Dr. Layla',
    lastName: 'Ibrahim',
    email: 'layla@ksu.edu.sa',
    password: 'Password123!',
    role: UserRole.RESEARCH,
    organization: 'King Saud University',
    position: 'Associate Professor',
    bio: 'Specializing in biotechnology research with applications in agriculture and food security.',
  },
  
  // Corporate innovators
  {
    firstName: 'Khalid',
    lastName: 'Al-Saud',
    email: 'khalid@aramco.com',
    password: 'Password123!',
    role: UserRole.CORPORATE,
    organization: 'Saudi Aramco',
    position: 'Innovation Director',
    bio: 'Leading digital transformation and sustainability initiatives at Saudi Aramco.',
  },
  {
    firstName: 'Nora',
    lastName: 'Al-Rashid',
    email: 'nora@sabic.com',
    password: 'Password123!',
    role: UserRole.CORPORATE,
    organization: 'SABIC',
    position: 'Head of R&D',
    bio: 'Driving research and development of new materials and chemical processes at SABIC.',
  },
  
  // Government innovators
  {
    firstName: 'Abdullah',
    lastName: 'Al-Otaibi',
    email: 'abdullah@mcit.gov.sa',
    password: 'Password123!',
    role: UserRole.GOVERNMENT,
    organization: 'Ministry of Communications and Information Technology',
    position: 'Digital Transformation Lead',
    bio: 'Working on national digital transformation initiatives as part of Saudi Vision 2030.',
  },
  {
    firstName: 'Hana',
    lastName: 'Al-Harbi',
    email: 'hana@misa.gov.sa',
    password: 'Password123!',
    role: UserRole.GOVERNMENT,
    organization: 'Ministry of Investment',
    position: 'Innovation Program Manager',
    bio: 'Developing programs to attract and support innovative investments in Saudi Arabia.',
  },
  
  // Investor innovators
  {
    firstName: 'Saad',
    lastName: 'Al-Faisal',
    email: 'saad@svc.sa',
    password: 'Password123!',
    role: UserRole.INVESTOR,
    organization: 'Saudi Venture Capital',
    position: 'Investment Director',
    bio: 'Investing in early-stage technology startups across Saudi Arabia and the MENA region.',
  },
  {
    firstName: 'Reem',
    lastName: 'Al-Malik',
    email: 'reem@impactfund.sa',
    password: 'Password123!',
    role: UserRole.INVESTOR,
    organization: 'Impact Investment Fund',
    position: 'Managing Partner',
    bio: 'Leading investments in social enterprises and sustainable businesses in Saudi Arabia.',
  },
  
  // Individual innovators
  {
    firstName: 'Youssef',
    lastName: 'Al-Hamdan',
    email: 'youssef@gmail.com',
    password: 'Password123!',
    role: UserRole.INDIVIDUAL,
    organization: 'Independent',
    position: 'Entrepreneur',
    bio: 'Serial entrepreneur with experience in e-commerce and fintech sectors.',
  },
  {
    firstName: 'Aisha',
    lastName: 'Al-Ghamdi',
    email: 'aisha@outlook.com',
    password: 'Password123!',
    role: UserRole.INDIVIDUAL,
    organization: 'Freelance',
    position: 'Innovation Consultant',
    bio: 'Helping organizations develop and implement innovation strategies and frameworks.',
  },
  
  // Organization innovators
  {
    firstName: 'Omar',
    lastName: 'Al-Amoudi',
    email: 'omar@kacst.org',
    password: 'Password123!',
    role: UserRole.ORGANIZATION,
    organization: 'King Abdulaziz City for Science and Technology',
    position: 'Executive Director',
    bio: 'Leading national research and development initiatives at KACST.',
  },
  {
    firstName: 'Maryam',
    lastName: 'Al-Dossari',
    email: 'maryam@innovationhub.org',
    password: 'Password123!',
    role: UserRole.ORGANIZATION,
    organization: 'Saudi Innovation Hub',
    position: 'Program Director',
    bio: 'Running innovation programs and incubation services for Saudi entrepreneurs.',
  },
  
  // Admin user
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@sanad.sa',
    password: 'Admin123!',
    role: ALL_ROLES.ADMIN,
    organization: 'SANAD Platform',
    position: 'System Administrator',
    bio: 'Managing the SANAD platform and its users.',
  },
];

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

// Sample partnerships data
const partnershipSeedData = [
  {
    title: 'Sustainable Agriculture Research Initiative',
    description: 'A partnership to develop sustainable agriculture practices for arid environments.',
    participants: ['King Abdullah University of Science and Technology', 'Ministry of Environment, Water and Agriculture'],
    status: PartnershipStatus.ACTIVE,
    duration: '3 years',
    resources: 'Research facilities, funding of SAR 5,000,000, and field testing sites',
    expectedOutcomes: 'Development of water-efficient farming techniques and drought-resistant crop varieties.',
  },
  {
    title: 'Digital Health Innovation Program',
    description: 'Collaborative program to accelerate digital health innovations in Saudi Arabia.',
    participants: ['Ministry of Health', 'Saudi Health Informatics Association', 'King Faisal Specialist Hospital'],
    status: PartnershipStatus.ACTIVE,
    duration: '2 years',
    resources: 'Access to health data, clinical testing environments, and SAR 3,000,000 in funding',
    expectedOutcomes: 'Development and implementation of at least 5 digital health solutions in Saudi healthcare facilities.',
  },
  {
    title: 'Renewable Energy Technology Transfer',
    description: 'Partnership for technology transfer and localization of renewable energy technologies.',
    participants: ['ACWA Power', 'King Abdullah University of Science and Technology', 'Saudi Electricity Company'],
    status: PartnershipStatus.PROPOSED,
    duration: '4 years',
    resources: 'Technical expertise, testing facilities, and implementation sites',
    expectedOutcomes: 'Localization of solar panel manufacturing and development of local technical expertise.',
  },
  {
    title: 'AI Research Consortium',
    description: 'Collaborative research consortium focused on artificial intelligence applications.',
    participants: ['King Abdulaziz City for Science and Technology', 'Saudi Data and AI Authority', 'Saudi Aramco'],
    status: PartnershipStatus.ACTIVE,
    duration: '5 years',
    resources: 'Computing infrastructure, research grants of SAR 10,000,000, and industry data access',
    expectedOutcomes: 'Development of AI applications for oil and gas, healthcare, and government services.',
  },
  {
    title: 'Tourism Technology Accelerator',
    description: 'Partnership to accelerate technology adoption in the Saudi tourism sector.',
    participants: ['Ministry of Tourism', 'Saudi Tourism Authority', 'Neom'],
    status: PartnershipStatus.PROPOSED,
    duration: '2 years',
    resources: 'Funding of SAR 2,000,000, mentorship, and pilot implementation opportunities',
    expectedOutcomes: 'Development and deployment of at least 10 tourism technology solutions across Saudi destinations.',
  },
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection established for seeding');

    // Clear existing data if needed
    // Uncomment these lines if you want to clear existing data before seeding
    // await AppDataSource.query('DELETE FROM partnerships');
    // await AppDataSource.query('DELETE FROM challenges');
    // await AppDataSource.query('DELETE FROM users');
    
    logger.info('Seeding users...');
    
    // Create users
    const userRepository = AppDataSource.getRepository(User);
    const createdUsers: Record<string, User> = {};
    
    // Check if admin user already exists to avoid duplicates
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@sanad.sa' } });
    
    if (!existingAdmin) {
      // Process and insert all users
      for (const userData of innovatorSeedData) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Create and save the user
        const user = new User();
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.email = userData.email;
        user.password = hashedPassword;
        user.role = userData.role;
        user.organization = userData.organization;
        user.position = userData.position;
        user.bio = userData.bio;
        user.isVerified = true; // All seed users are verified
        
        const savedUser = await userRepository.save(user);
        createdUsers[userData.email] = savedUser;
        logger.info(`Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      }
    } else {
      logger.info('Admin user already exists, skipping user seeding');
      // Get existing users for reference in challenges and partnerships
      const existingUsers = await userRepository.find();
      existingUsers.forEach(user => {
        createdUsers[user.email] = user;
      });
    }
    
    // Seed challenges
    logger.info('Seeding challenges...');
    const challengeRepository = AppDataSource.getRepository(Challenge);
    
    // Check if challenges already exist
    const existingChallengesCount = await challengeRepository.count();
    
    if (existingChallengesCount === 0) {
      // Get a random user to be the creator of challenges
      const adminUser = createdUsers['admin@sanad.sa'] || Object.values(createdUsers)[0];
      
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
        challenge.createdBy = adminUser;
        
        await challengeRepository.save(challenge);
        logger.info(`Created challenge: ${challengeData.title}`);
      }
    } else {
      logger.info('Challenges already exist, skipping challenge seeding');
    }
    
    // Seed partnerships
    logger.info('Seeding partnerships...');
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    
    // Check if partnerships already exist
    const existingPartnershipsCount = await partnershipRepository.count();
    
    if (existingPartnershipsCount === 0) {
      // Get a random user to be the creator of partnerships
      const adminUser = createdUsers['admin@sanad.sa'] || Object.values(createdUsers)[0];
      
      for (const partnershipData of partnershipSeedData) {
        const partnership = new Partnership();
        partnership.title = partnershipData.title;
        partnership.description = partnershipData.description;
        partnership.participants = partnershipData.participants;
        partnership.status = partnershipData.status;
        partnership.duration = partnershipData.duration;
        partnership.resources = partnershipData.resources;
        partnership.expectedOutcomes = partnershipData.expectedOutcomes;
        partnership.createdById = adminUser.id;
        partnership.createdBy = adminUser;
        
        await partnershipRepository.save(partnership);
        logger.info(`Created partnership: ${partnershipData.title}`);
      }
    } else {
      logger.info('Partnerships already exist, skipping partnership seeding');
    }
    
    logger.info('Database seeding completed successfully');
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding database: ${error}`);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase(); 