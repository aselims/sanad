import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { Challenge, ChallengeType, ChallengeStatus } from '../entities/Challenge';
import { Partnership, PartnershipStatus } from '../entities/Partnership';
import { Idea, IdeaStage, IdeaStatus } from '../entities/Idea';
import * as bcrypt from 'bcryptjs';
import logger from '../utils/logger';

// ========== USER SEED DATA ==========
const innovatorSeedData = [
  // Admin user
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@sanad.sa',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    organization: 'Sanad Platform',
    position: 'System Administrator',
    bio: 'Managing the Sanad platform and its users.',
    location: 'Riyadh',
    interests: ['System Administration', 'Platform Management', 'User Support'],
    tags: ['technology', 'administration', 'support', 'management']
  },
  // Startup innovator
  {
    firstName: 'Ahmed',
    lastName: 'Al-Farsi',
    email: 'ahmed@techstartup.sa',
    password: 'Password123!',
    role: UserRole.STARTUP,
    organization: 'EcoTech Solutions',
    position: 'Founder & CEO',
    bio: 'Leading a startup focused on sustainable technology solutions for urban environments in Saudi Arabia.',
    location: 'Jeddah',
    interests: ['Sustainable Technology', 'Urban Planning', 'Green Energy', 'Entrepreneurship'],
    tags: ['sustainability', 'cleantech', 'urban', 'startup', 'green energy']
  },
  // Research innovator
  {
    firstName: 'Dr. Mohammed',
    lastName: 'Al-Qahtani',
    email: 'mohammed@kaust.edu.sa',
    password: 'Password123!',
    role: UserRole.RESEARCH,
    organization: 'King Abdullah University of Science and Technology',
    position: 'Research Director',
    bio: 'Leading research in renewable energy technologies with a focus on solar applications in desert environments.',
    location: 'Thuwal',
    interests: ['Renewable Energy', 'Solar Technology', 'Materials Science', 'Desert Applications'],
    tags: ['research', 'solar', 'renewable', 'energy', 'academic', 'science']
  },
  // Corporate innovator
  {
    firstName: 'Khalid',
    lastName: 'Al-Saud',
    email: 'khalid@aramco.com',
    password: 'Password123!',
    role: UserRole.CORPORATE,
    organization: 'Saudi Aramco',
    position: 'Innovation Director',
    bio: 'Leading digital transformation and sustainability initiatives at Saudi Aramco.',
    location: 'Dhahran',
    interests: ['Digital Transformation', 'Corporate Innovation', 'Oil & Gas', 'Sustainability'],
    tags: ['corporate', 'innovation', 'energy', 'digital', 'transformation', 'oil']
  },
  // Government innovator
  {
    firstName: 'Abdullah',
    lastName: 'Al-Otaibi',
    email: 'abdullah@mcit.gov.sa',
    password: 'Password123!',
    role: UserRole.GOVERNMENT,
    organization: 'Ministry of Communications and Information Technology',
    position: 'Digital Transformation Lead',
    bio: 'Working on national digital transformation initiatives as part of Saudi Vision 2030.',
    location: 'Riyadh',
    interests: ['Digital Government', 'Public Policy', 'Smart Cities', 'Vision 2030'],
    tags: ['government', 'policy', 'digital', 'transformation', 'vision2030', 'smart cities']
  },
  // Investor innovator
  {
    firstName: 'Saad',
    lastName: 'Al-Faisal',
    email: 'saad@svc.sa',
    password: 'Password123!',
    role: UserRole.INVESTOR,
    organization: 'Saudi Venture Capital',
    position: 'Investment Director',
    bio: 'Investing in early-stage technology startups across Saudi Arabia and the MENA region.',
    location: 'Riyadh',
    interests: ['Venture Capital', 'Investment', 'Startup Funding', 'Financial Analysis'],
    tags: ['investment', 'venture capital', 'funding', 'startups', 'finance', 'technology']
  },
  // Individual innovator
  {
    firstName: 'Youssef',
    lastName: 'Al-Hamdan',
    email: 'youssef@gmail.com',
    password: 'Password123!',
    role: UserRole.INDIVIDUAL,
    organization: 'Independent',
    position: 'Entrepreneur',
    bio: 'Serial entrepreneur with experience in e-commerce and fintech sectors.',
    location: 'Jeddah',
    interests: ['E-commerce', 'Fintech', 'Entrepreneurship', 'Digital Marketing'],
    tags: ['entrepreneur', 'e-commerce', 'fintech', 'startup', 'digital']
  },
  // Organization innovator
  {
    firstName: 'Omar',
    lastName: 'Al-Amoudi',
    email: 'omar@kacst.org',
    password: 'Password123!',
    role: UserRole.ORGANIZATION,
    organization: 'King Abdulaziz City for Science and Technology',
    position: 'Executive Director',
    bio: 'Leading national research and development initiatives at KACST.',
    location: 'Riyadh',
    interests: ['Research Management', 'Technology Transfer', 'Innovation Policy', 'Science Administration'],
    tags: ['research', 'science', 'technology', 'innovation', 'policy', 'development']
  },
  // Accelerator innovator
  {
    firstName: 'Nadia',
    lastName: 'Al-Qahtani',
    email: 'accelerator@example.com',
    password: 'Accelerator123!',
    role: UserRole.ACCELERATOR,
    organization: 'Riyadh Accelerator',
    position: 'Program Director',
    bio: 'Leading a startup accelerator program that helps early-stage companies scale rapidly through mentorship and funding.',
    location: 'Riyadh',
    interests: ['Startup Acceleration', 'Mentorship', 'Seed Funding', 'Entrepreneurship Development'],
    tags: ['accelerator', 'startups', 'mentorship', 'funding', 'entrepreneurship', 'scaling']
  },
  // Incubator innovator
  {
    firstName: 'Tariq',
    lastName: 'Al-Mansour',
    email: 'incubator@example.com',
    password: 'Incubator123!',
    role: UserRole.INCUBATOR,
    organization: 'Jeddah Innovation Incubator',
    position: 'Executive Director',
    bio: 'Managing an incubator that provides resources, space, and support for early-stage startups to develop their ideas.',
    location: 'Jeddah',
    interests: ['Startup Incubation', 'Business Development', 'Innovation Management', 'Entrepreneurship Support'],
    tags: ['incubator', 'startups', 'innovation', 'entrepreneurship', 'business development']
  },
  // Female Entrepreneur
  {
    firstName: 'Fatima',
    lastName: 'Al-Zahrani',
    email: 'fatima@aihealth.sa',
    password: 'Password123!',
    role: UserRole.STARTUP,
    organization: 'AI Health Innovations',
    position: 'Co-founder & CTO',
    bio: 'Developing AI-powered healthcare solutions to improve patient outcomes and medical efficiency.',
    location: 'Riyadh',
    interests: ['Artificial Intelligence', 'Healthcare Innovation', 'Women in Tech', 'Entrepreneurship'],
    tags: ['ai', 'healthcare', 'technology', 'startup', 'womenintechnology']
  },
  // Female Researcher
  {
    firstName: 'Layla',
    lastName: 'Ibrahim',
    email: 'layla@ksu.edu.sa',
    password: 'Password123!',
    role: UserRole.RESEARCH,
    organization: 'King Saud University',
    position: 'Associate Professor',
    bio: 'Specializing in biotechnology research with applications in agriculture and food security.',
    location: 'Riyadh',
    interests: ['Biotechnology', 'Agricultural Science', 'Food Security', 'Research'],
    tags: ['biotech', 'research', 'agriculture', 'academic', 'science', 'food']
  },
];

// ========== CHALLENGE SEED DATA ==========
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

// ========== PARTNERSHIP SEED DATA ==========
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

// ========== IDEA SEED DATA ==========
const ideasData = [
  {
    title: 'Smart Water Conservation System',
    description: 'A smart IoT-based water management system that monitors and optimizes water usage in agricultural settings, reducing waste by up to 40% while maintaining crop yields.',
    category: 'Agriculture',
    stage: IdeaStage.PROTOTYPE,
    targetAudience: 'Farmers and agricultural businesses in arid regions',
    potentialImpact: 'Significant reduction in water consumption for agriculture, enabling sustainable farming in water-scarce regions',
    resourcesNeeded: 'IoT hardware expertise, agricultural partnerships for field testing, and funding for prototype deployment',
    creatorEmail: 'ahmed@techstartup.sa',
  },
  {
    title: 'AI-Powered Medical Diagnosis Assistant',
    description: 'An artificial intelligence system that helps doctors diagnose rare diseases by analyzing patient symptoms, medical history, and comparing with global medical databases.',
    category: 'Healthcare',
    stage: IdeaStage.VALIDATED,
    targetAudience: 'Healthcare providers, hospitals, and medical clinics',
    potentialImpact: 'Faster and more accurate diagnosis of rare conditions, reducing misdiagnosis rates and improving patient outcomes',
    resourcesNeeded: 'Medical data partnerships, AI development expertise, and regulatory compliance support',
    creatorEmail: 'fatima@aihealth.sa',
  },
  {
    title: 'Solar-Powered Desalination Units',
    description: 'Compact, modular desalination units powered entirely by solar energy, designed for deployment in coastal communities with limited access to fresh water.',
    category: 'Environment',
    stage: IdeaStage.CONCEPT,
    targetAudience: 'Coastal communities facing water scarcity',
    potentialImpact: 'Sustainable access to clean drinking water without reliance on fossil fuels or extensive infrastructure',
    resourcesNeeded: 'Engineering expertise in desalination technology, solar power integration, and funding for initial prototypes',
    creatorEmail: 'mohammed@kaust.edu.sa',
  },
  {
    title: 'Blockchain-Based Supply Chain Verification',
    description: 'A blockchain platform that enables end-to-end verification of product origins and handling, ensuring authenticity and ethical sourcing for consumers.',
    category: 'Technology',
    stage: IdeaStage.PROTOTYPE,
    targetAudience: 'Retail businesses, manufacturers, and conscious consumers',
    potentialImpact: 'Increased transparency in global supply chains, reduction in counterfeit products, and support for ethical business practices',
    resourcesNeeded: 'Blockchain developers, industry partnerships for pilot implementation, and UX design expertise',
    creatorEmail: 'layla@ksu.edu.sa',
  },
  {
    title: 'Microplastic Filtering System for Washing Machines',
    description: 'An affordable filter attachment for washing machines that captures microplastics from synthetic clothing before they enter the water system.',
    category: 'Environment',
    stage: IdeaStage.SCALING,
    targetAudience: 'Environmentally conscious consumers and appliance manufacturers',
    potentialImpact: 'Significant reduction in microplastic pollution in oceans and waterways',
    resourcesNeeded: 'Manufacturing partnerships, distribution channels, and marketing support',
    creatorEmail: 'ahmed@techstartup.sa',
  },
  {
    title: 'Virtual Reality Educational Platform for Cultural Heritage',
    description: 'A VR platform that allows students to explore historical sites and cultural artifacts in an immersive, interactive environment, preserving cultural heritage while making it accessible globally.',
    category: 'Education',
    stage: IdeaStage.CONCEPT,
    targetAudience: 'Educational institutions, museums, and cultural organizations',
    potentialImpact: 'Enhanced preservation and global access to cultural heritage, improved educational outcomes through immersive learning',
    resourcesNeeded: '3D modeling expertise, cultural heritage partnerships, and VR development resources',
    creatorEmail: 'fatima@aihealth.sa',
  },
  {
    title: 'Biodegradable Packaging from Agricultural Waste',
    description: 'A process to convert agricultural waste into fully biodegradable packaging materials, reducing both waste and plastic pollution.',
    category: 'Sustainability',
    stage: IdeaStage.VALIDATED,
    targetAudience: 'Food producers, retailers, and packaging manufacturers',
    potentialImpact: 'Reduction in plastic waste and repurposing of agricultural byproducts into valuable materials',
    resourcesNeeded: 'Materials science expertise, manufacturing facilities, and certification support',
    creatorEmail: 'mohammed@kaust.edu.sa',
  },
  {
    title: 'Peer-to-Peer Energy Trading Platform',
    description: 'A platform enabling households with solar panels to sell excess energy directly to neighbors, creating a localized renewable energy marketplace.',
    category: 'Energy',
    stage: IdeaStage.PROTOTYPE,
    targetAudience: 'Homeowners with renewable energy installations and energy consumers',
    potentialImpact: 'Accelerated adoption of renewable energy and more efficient use of locally generated power',
    resourcesNeeded: 'Software development, regulatory navigation expertise, and pilot community partnerships',
    creatorEmail: 'layla@ksu.edu.sa',
  }
];

// =================== UTILITY FUNCTIONS ===================

/**
 * Hash a password using the same method as the main application
 * Instead of defining our own function, import the hashPassword utility
 * to ensure consistency between seeded users and registered users
 */
const hashPassword = async (password: string): Promise<string> => {
  // Import the password utility from the main application
  const { hashPassword: appHashPassword } = await import('../utils/password');
  return appHashPassword(password);
};

// =================== SEEDING FUNCTIONS ===================

/**
 * Seed users
 */
const seedUsers = async (): Promise<User | null> => {
  try {
    logger.info('Seeding users...');
    
    // Create users
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if admin user already exists to avoid duplicates
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@sanad.sa' } });
    
    if (existingAdmin) {
      logger.info('Admin user already exists, skipping user seeding');
      return existingAdmin;
    }
    
    let adminUser: User | null = null;
    
    // Process and insert all users
    for (const userData of innovatorSeedData) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });
      if (existingUser) {
        logger.info(`User ${userData.email} already exists, updating with new values`);
        
        // Update existing user with new values
        existingUser.firstName = userData.firstName;
        existingUser.lastName = userData.lastName;
        existingUser.role = userData.role;
        existingUser.organization = userData.organization;
        existingUser.position = userData.position;
        existingUser.bio = userData.bio;
        
        // Add new profile fields
        if (userData.location) existingUser.location = userData.location;
        if (userData.interests) existingUser.interests = userData.interests;
        if (userData.tags) existingUser.tags = userData.tags;
        
        await userRepository.save(existingUser);
        logger.info(`Updated user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
        
        if (userData.email === 'admin@sanad.sa') {
          adminUser = existingUser;
        }
        
        continue;
      }
      
      // Create the user
      const user = new User();
      user.email = userData.email;
      user.password = await hashPassword(userData.password);
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.role = userData.role;
      user.organization = userData.organization;
      user.position = userData.position;
      user.bio = userData.bio;
      user.isVerified = true; // All seed users are verified
      
      // Add new profile fields
      if (userData.location) user.location = userData.location;
      if (userData.interests) user.interests = userData.interests;
      if (userData.tags) user.tags = userData.tags;
      
      await userRepository.save(user);
      logger.info(`Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      
      if (userData.email === 'admin@sanad.sa') {
        adminUser = user;
      }
    }
    
    logger.info('User seeding completed successfully');
    return adminUser;
  } catch (error) {
    logger.error(`Error seeding users: ${error}`);
    return null;
  }
};

/**
 * Seed challenges
 */
const seedChallenges = async (adminUser: User): Promise<void> => {
  try {
    logger.info('Seeding challenges...');
    
    // Get repository
    const challengeRepository = AppDataSource.getRepository(Challenge);
    
    // Check if challenges already exist
    const existingChallengesCount = await challengeRepository.count();
    
    if (existingChallengesCount > 0) {
      logger.info('Challenges already exist, skipping challenge seeding');
      return;
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
  } catch (error) {
    logger.error(`Error seeding challenges: ${error}`);
  }
};

/**
 * Seed partnerships
 */
const seedPartnerships = async (adminUser: User): Promise<void> => {
  try {
    logger.info('Seeding partnerships...');
    
    // Get repository
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    
    // Check if partnerships already exist
    const existingPartnershipsCount = await partnershipRepository.count();
    
    if (existingPartnershipsCount > 0) {
      logger.info('Partnerships already exist, skipping partnership seeding');
      return;
    }
    
    // Create and save partnerships
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
      
      await partnershipRepository.save(partnership);
      logger.info(`Created partnership: ${partnershipData.title}`);
    }
    
    logger.info('Partnership seeding completed successfully');
  } catch (error) {
    logger.error(`Error seeding partnerships: ${error}`);
  }
};

/**
 * Seed ideas
 */
const seedIdeas = async (): Promise<void> => {
  try {
    logger.info('Seeding ideas...');
    
    const ideaRepository = AppDataSource.getRepository(Idea);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if ideas already exist
    const existingIdeasCount = await ideaRepository.count();
    if (existingIdeasCount > 0) {
      logger.info(`${existingIdeasCount} ideas already exist in the database. Skipping seed.`);
      return;
    }
    
    // Create ideas
    for (const ideaData of ideasData) {
      // Find the creator user
      const creator = await userRepository.findOne({
        where: { email: ideaData.creatorEmail }
      });
      
      if (!creator) {
        logger.warn(`Creator with email ${ideaData.creatorEmail} not found. Skipping idea: ${ideaData.title}`);
        continue;
      }
      
      // Create the idea
      const idea = new Idea();
      idea.title = ideaData.title;
      idea.description = ideaData.description;
      idea.category = ideaData.category;
      idea.stage = ideaData.stage;
      idea.targetAudience = ideaData.targetAudience;
      idea.potentialImpact = ideaData.potentialImpact;
      idea.resourcesNeeded = ideaData.resourcesNeeded;
      idea.status = IdeaStatus.PROPOSED;
      idea.createdBy = creator;
      idea.createdById = creator.id;
      
      // Set participants (creator is always the first participant)
      const creatorName = `${creator.firstName} ${creator.lastName}`;
      idea.participants = [creatorName];
      
      await ideaRepository.save(idea);
      logger.info(`Created idea: ${idea.title}`);
    }
    
    logger.info(`Successfully seeded ${ideasData.length} ideas`);
  } catch (error) {
    logger.error('Error seeding ideas:', error);
  }
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection established for seeding');
    
    // Seed users first (since other entities depend on them)
    const adminUser = await seedUsers();
    
    if (!adminUser) {
      logger.error('Failed to create or find admin user. Cannot proceed with seeding other entities.');
      process.exit(1);
    }
    
    // Seed challenges, partnerships, and ideas
    await seedChallenges(adminUser);
    await seedPartnerships(adminUser);
    await seedIdeas();
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
    logger.info('All database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding database: ${error}`);
    // Try to close connection if it was opened
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    } catch (e) {
      logger.error(`Error closing database connection: ${e}`);
    }
    
    process.exit(1);
  }
};

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

// Export for programmatic usage
export { seedDatabase }; 