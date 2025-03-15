import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Idea, IdeaStage, IdeaStatus } from '../entities/Idea';
import logger from '../utils/logger';

// Sample ideas data
const ideasData = [
  {
    title: 'Smart Water Conservation System',
    description: 'A smart IoT-based water management system that monitors and optimizes water usage in agricultural settings, reducing waste by up to 40% while maintaining crop yields.',
    category: 'Agriculture',
    stage: IdeaStage.PROTOTYPE,
    targetAudience: 'Farmers and agricultural businesses in arid regions',
    potentialImpact: 'Significant reduction in water consumption for agriculture, enabling sustainable farming in water-scarce regions',
    resourcesNeeded: 'IoT hardware expertise, agricultural partnerships for field testing, and funding for prototype deployment',
    creatorEmail: 'ahmed@techstartup.sa', // Will be replaced with actual user ID
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

/**
 * Seed the database with sample ideas
 */
const seedIdeas = async () => {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized');

    const ideaRepository = AppDataSource.getRepository(Idea);
    const userRepository = AppDataSource.getRepository(User);

    // Check if ideas already exist
    const existingIdeasCount = await ideaRepository.count();
    if (existingIdeasCount > 0) {
      logger.info(`${existingIdeasCount} ideas already exist in the database. Skipping seed.`);
      await AppDataSource.destroy();
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
    await AppDataSource.destroy();
  } catch (error) {
    logger.error('Error seeding ideas:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
};

// Run the seed function
seedIdeas()
  .then(() => {
    logger.info('Ideas seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Error during ideas seeding:', error);
    process.exit(1);
  }); 