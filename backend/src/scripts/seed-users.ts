import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import * as bcrypt from 'bcrypt';
import logger from '../utils/logger';

// Sample data for each innovator type
const innovatorSeedData = [
  // Admin user
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@Saned.sa',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    organization: 'Saned Platform',
    position: 'System Administrator',
    bio: 'Managing the Saned platform and its users.',
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
];

// New users to add even if admin exists
const newInnovatorTypes = [
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
];

// Function to seed the database
const seedUsers = async () => {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection established for seeding users');
    
    // Create users
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if admin user already exists to avoid duplicates
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@Saned.sa' } });
    
    if (!existingAdmin) {
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
          continue;
        }
        
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
        
        // Add new profile fields
        if (userData.location) user.location = userData.location;
        if (userData.interests) user.interests = userData.interests;
        if (userData.tags) user.tags = userData.tags;
        
        await userRepository.save(user);
        logger.info(`Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      }
      
      logger.info('User seeding completed successfully');
    } else {
      logger.info('Admin user already exists, checking for new innovator types');
      
      // Add new innovator types even if admin exists
      for (const userData of newInnovatorTypes) {
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
          continue;
        }
        
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
        
        // Add new profile fields
        if (userData.location) user.location = userData.location;
        if (userData.interests) user.interests = userData.interests;
        if (userData.tags) user.tags = userData.tags;
        
        await userRepository.save(user);
        logger.info(`Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      }
    }
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding users: ${error}`);
    process.exit(1);
  }
};

// Run the seeding function
seedUsers(); 