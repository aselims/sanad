import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Partnership, PartnershipStatus } from '../entities/Partnership';
import logger from '../utils/logger';

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

// Function to seed partnerships
const seedPartnerships = async () => {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection established for seeding partnerships');
    
    // Get repositories
    const partnershipRepository = AppDataSource.getRepository(Partnership);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if partnerships already exist
    const existingPartnershipsCount = await partnershipRepository.count();
    
    if (existingPartnershipsCount === 0) {
      // Get admin user to be the creator
      const adminUser = await userRepository.findOne({ where: { email: 'admin@sanad.sa' } });
      
      if (!adminUser) {
        logger.error('Admin user not found. Please run seed-users.ts first.');
        process.exit(1);
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
    } else {
      logger.info('Partnerships already exist, skipping partnership seeding');
    }
    
    // Close the database connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding partnerships: ${error}`);
    process.exit(1);
  }
};

// Run the seeding function
seedPartnerships(); 