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
    email: 'admin@sanad.sa',
    password: 'Admin123!',
    role: UserRole.ADMIN,
    organization: 'SANAD Platform',
    position: 'System Administrator',
    bio: 'Managing the SANAD platform and its users.',
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
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@sanad.sa' } });
    
    if (!existingAdmin) {
      // Process and insert all users
      for (const userData of innovatorSeedData) {
        // Check if user already exists
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });
        if (existingUser) {
          logger.info(`User ${userData.email} already exists, skipping`);
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
        
        await userRepository.save(user);
        logger.info(`Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      }
      
      logger.info('User seeding completed successfully');
    } else {
      logger.info('Admin user already exists, skipping user seeding');
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