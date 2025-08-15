import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { Challenge, ChallengeType, ChallengeStatus } from '../entities/Challenge';
import { Partnership, PartnershipStatus } from '../entities/Partnership';
import { Idea, IdeaStage, IdeaStatus } from '../entities/Idea';
import { Collaboration, CollaborationType, CollaborationStatus } from '../entities/Collaboration';
import { Match } from '../entities/Match';
import { Connection, ConnectionStatus } from '../entities/Connection';
import { Message } from '../entities/Message';
import { Notification, NotificationType } from '../entities/Notification';
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
    organization: 'Collopi Platform',
    position: 'System Administrator',
    bio: 'Managing the Collopi platform and its users.',
    location: 'Riyadh',
    interests: ['System Administration', 'Platform Management', 'User Support'],
    tags: ['Demo', 'technology', 'administration', 'support', 'management']
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
    tags: ['Demo', 'sustainability', 'cleantech', 'urban', 'startup', 'green energy']
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
    tags: ['Demo', 'research', 'solar', 'renewable', 'energy', 'academic', 'science']
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
    tags: ['Demo', 'corporate', 'innovation', 'energy', 'digital', 'transformation', 'oil']
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
    tags: ['Demo', 'government', 'policy', 'digital', 'transformation', 'vision2030', 'smart cities']
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
    tags: ['Demo', 'investment', 'venture capital', 'funding', 'startups', 'finance', 'technology']
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
    tags: ['Demo', 'entrepreneur', 'e-commerce', 'fintech', 'startup', 'digital']
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
    tags: ['Demo', 'research', 'science', 'technology', 'innovation', 'policy', 'development']
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
    tags: ['Demo', 'accelerator', 'startups', 'mentorship', 'funding', 'entrepreneurship', 'scaling']
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
    tags: ['Demo', 'incubator', 'startups', 'innovation', 'entrepreneurship', 'business development']
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
    tags: ['Demo', 'ai', 'healthcare', 'technology', 'startup', 'womenintechnology']
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
    tags: ['Demo', 'biotech', 'research', 'agriculture', 'academic', 'science', 'food']
  },
  // NEOM Tech Innovator
  {
    firstName: 'Sarah',
    lastName: 'Al-Rashid',
    email: 'sarah@neom.sa',
    password: 'Password123!',
    role: UserRole.CORPORATE,
    organization: 'NEOM',
    position: 'Chief Technology Officer',
    bio: 'Leading the development of futuristic smart city technologies and sustainable urban solutions for NEOM megaproject.',
    location: 'NEOM',
    interests: ['Smart Cities', 'Futuristic Technology', 'Sustainability', 'Urban Planning', 'IoT'],
    tags: ['Demo', 'neom', 'smart-city', 'technology', 'sustainability', 'innovation', 'megaproject']
  },
  // Vision 2030 Program Director
  {
    firstName: 'Mansour',
    lastName: 'Al-Harbi',
    email: 'mansour@vision2030.gov.sa',
    password: 'Password123!',
    role: UserRole.GOVERNMENT,
    organization: 'Vision 2030 Realization Office',
    position: 'Strategic Program Director',
    bio: 'Overseeing strategic initiatives to achieve Saudi Vision 2030 goals through innovation and economic diversification.',
    location: 'Riyadh',
    interests: ['Strategic Planning', 'Economic Diversification', 'Innovation Policy', 'Vision 2030'],
    tags: ['Demo', 'vision2030', 'strategy', 'economic-diversification', 'government', 'policy', 'innovation']
  },
  // Green Saudi Initiative Expert
  {
    firstName: 'Nora',
    lastName: 'Al-Ghamdi',
    email: 'nora@greeninitiative.sa',
    password: 'Password123!',
    role: UserRole.ORGANIZATION,
    organization: 'Green Saudi Initiative',
    position: 'Environmental Innovation Director',
    bio: 'Developing environmental technologies and sustainable solutions to support Saudi Arabia\'s commitment to net-zero emissions by 2060.',
    location: 'Riyadh',
    interests: ['Environmental Technology', 'Climate Change', 'Renewable Energy', 'Sustainability'],
    tags: ['Demo', 'green-saudi', 'environment', 'sustainability', 'climate', 'renewable-energy', 'net-zero']
  },
  // Sports and Entertainment Entrepreneur
  {
    firstName: 'Faisal',
    lastName: 'Al-Dosari',
    email: 'faisal@entertainment.sa',
    password: 'Password123!',
    role: UserRole.STARTUP,
    organization: 'Saudi Entertainment Ventures',
    position: 'Founder & CEO',
    bio: 'Building innovative entertainment and sports tech platforms to support Saudi Arabia\'s growing entertainment sector.',
    location: 'Riyadh',
    interests: ['Entertainment Technology', 'Sports Innovation', 'Event Management', 'Digital Media'],
    tags: ['Demo', 'entertainment', 'sports', 'technology', 'events', 'media', 'startup']
  },
  // Circular Economy Specialist
  {
    firstName: 'Reem',
    lastName: 'Al-Mutawa',
    email: 'reem@circular.sa',
    password: 'Password123!',
    role: UserRole.INDIVIDUAL,
    organization: 'Independent Consultant',
    position: 'Circular Economy Advisor',
    bio: 'Helping organizations transition to circular economy models and implement sustainable waste management practices.',
    location: 'Jeddah',
    interests: ['Circular Economy', 'Waste Management', 'Sustainability Consulting', 'Resource Efficiency'],
    tags: ['Demo', 'circular-economy', 'sustainability', 'waste-management', 'consulting', 'efficiency']
  },
  // Space Technology Researcher
  {
    firstName: 'Dr. Khalid',
    lastName: 'Al-Zahrani',
    email: 'khalid@space.sa',
    password: 'Password123!',
    role: UserRole.RESEARCH,
    organization: 'Saudi Space Commission',
    position: 'Space Technology Research Director',
    bio: 'Leading research in satellite technology and space applications for Earth observation and communications.',
    location: 'Riyadh',
    interests: ['Space Technology', 'Satellite Systems', 'Earth Observation', 'Space Communications'],
    tags: ['Demo', 'space', 'satellite', 'technology', 'research', 'communications', 'earth-observation']
  },
  // Digital Health Investor
  {
    firstName: 'Amira',
    lastName: 'Al-Sudairy',
    email: 'amira@healthtech.sa',
    password: 'Password123!',
    role: UserRole.INVESTOR,
    organization: 'HealthTech Ventures Saudi',
    position: 'Managing Partner',
    bio: 'Investing in digital health startups and medical technology companies across the MENA region.',
    location: 'Riyadh',
    interests: ['Digital Health', 'Medical Technology', 'Healthcare Investment', 'Telemedicine'],
    tags: ['Demo', 'healthtech', 'digital-health', 'investment', 'medical', 'telemedicine', 'ventures']
  },
];

// ========== CHALLENGE SEED DATA ==========
const challengeSeedData = [
  {
    title: 'NEOM Hydrogen Economy Challenge 2024',
    description: 'Develop innovative solutions for green hydrogen production, storage, and distribution to establish NEOM as a global hydrogen hub.',
    organization: 'NEOM',
    type: ChallengeType.CORPORATE,
    status: ChallengeStatus.OPEN,
    deadline: '2025-03-31',
    reward: 'SAR 10,000,000 prize pool + commercial partnership opportunities',
    eligibilityCriteria: 'Open to technology companies, research institutions, and startups with hydrogen technology expertise.',
  },
  {
    title: 'Saudi Vision 2030 Digital Transformation Accelerator',
    description: 'Create AI-powered solutions to accelerate digital transformation in government services, healthcare, and education sectors.',
    organization: 'Vision 2030 Realization Office',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.OPEN,
    deadline: '2024-12-31',
    reward: 'SAR 5,000,000 funding + implementation across government entities',
    eligibilityCriteria: 'Open to AI companies, tech startups, and digital solution providers.',
  },
  {
    title: 'Circular Economy Innovation Challenge',
    description: 'Develop technologies and business models that convert waste into valuable resources, supporting Saudi Arabia\'s circular economy goals.',
    organization: 'Green Saudi Initiative',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.OPEN,
    deadline: '2024-11-15',
    reward: 'SAR 7,500,000 grant funding + pilot implementation support',
    eligibilityCriteria: 'Open to cleantech startups, waste management companies, and environmental technology providers.',
  },
  {
    title: 'Space Technology Applications Challenge',
    description: 'Leverage satellite technology and space applications for Earth observation, telecommunications, and navigation in Saudi Arabia.',
    organization: 'Saudi Space Commission',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.IN_PROGRESS,
    deadline: '2025-01-31',
    reward: 'SAR 15,000,000 funding + access to national space infrastructure',
    eligibilityCriteria: 'Open to space technology companies, satellite manufacturers, and aerospace research institutions.',
  },
  {
    title: 'Entertainment Tech Innovation Challenge',
    description: 'Create immersive entertainment experiences using AR/VR, AI, and interactive technologies for Saudi Arabia\'s growing entertainment sector.',
    organization: 'General Entertainment Authority',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.OPEN,
    deadline: '2024-09-30',
    reward: 'SAR 3,000,000 prize + implementation at major entertainment venues',
    eligibilityCriteria: 'Open to entertainment technology companies, gaming studios, and immersive experience developers.',
  },
  {
    title: 'Red Sea Tourism Innovation Hub',
    description: 'Develop sustainable tourism technologies and experiences for the Red Sea Project, focusing on marine conservation and luxury eco-tourism.',
    organization: 'Red Sea Global',
    type: ChallengeType.CORPORATE,
    status: ChallengeStatus.OPEN,
    deadline: '2024-08-31',
    reward: 'SAR 8,000,000 investment + deployment at Red Sea destinations',
    eligibilityCriteria: 'Open to tourism technology companies, marine conservation organizations, and sustainable hospitality providers.',
  },
  {
    title: 'Healthcare AI Diagnostics for Rural Areas',
    description: 'Develop AI-powered diagnostic tools specifically designed for remote healthcare delivery in rural Saudi communities.',
    organization: 'Ministry of Health',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.IN_PROGRESS,
    deadline: '2024-10-31',
    reward: 'SAR 6,000,000 funding + deployment in 50 rural healthcare centers',
    eligibilityCriteria: 'Open to healthtech startups, medical AI companies, and telemedicine providers.',
  },
  {
    title: 'Smart Agriculture for Desert Environments',
    description: 'Create innovative agricultural technologies that maximize crop yields while minimizing water usage in arid Saudi environments.',
    organization: 'Ministry of Environment, Water and Agriculture',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.OPEN,
    deadline: '2025-02-28',
    reward: 'SAR 12,000,000 grant + access to experimental agricultural facilities',
    eligibilityCriteria: 'Open to agtech companies, biotechnology firms, and agricultural research institutions.',
  },
  {
    title: 'Women Entrepreneurship Support Platform',
    description: 'Build digital platforms and tools that empower women entrepreneurs in Saudi Arabia with mentorship, funding, and market access.',
    organization: 'Monsha\'at (Small and Medium Enterprises General Authority)',
    type: ChallengeType.GOVERNMENT,
    status: ChallengeStatus.OPEN,
    deadline: '2024-07-31',
    reward: 'SAR 4,500,000 funding + nationwide platform deployment',
    eligibilityCriteria: 'Open to fintech companies, platform developers, and women-focused business solution providers.',
  },
  {
    title: 'Carbon Capture and Utilization Technologies',
    description: 'Develop innovative carbon capture, utilization, and storage (CCUS) technologies to support Saudi Arabia\'s net-zero emissions goal by 2060.',
    organization: 'Saudi Aramco',
    type: ChallengeType.CORPORATE,
    status: ChallengeStatus.OPEN,
    deadline: '2025-06-30',
    reward: 'SAR 25,000,000 investment + commercial partnership with Aramco',
    eligibilityCriteria: 'Open to cleantech companies, energy technology providers, and carbon management specialists.',
  }
];

// ========== PARTNERSHIP SEED DATA ==========
const partnershipSeedData = [
  {
    title: 'NEOM-KAUST Advanced Materials Consortium',
    description: 'Strategic partnership to develop next-generation materials for sustainable construction and manufacturing in NEOM\'s futuristic city development.',
    participants: ['NEOM', 'KAUST', 'SABIC'],
    status: PartnershipStatus.ACTIVE,
    duration: '5 years',
    resources: 'SAR 50,000,000 joint funding, world-class research facilities, and commercial testing sites',
    expectedOutcomes: 'Revolutionary sustainable building materials, reduced construction costs, and establishment of Saudi Arabia as a global materials innovation hub.',
  },
  {
    title: 'Vision 2030 Digital Government Transformation Alliance',
    description: 'Comprehensive partnership to digitize all government services and establish Saudi Arabia as a leader in digital governance.',
    participants: ['Vision 2030 Office', 'Saudi Data and AI Authority', 'MCIT', 'Elm Company'],
    status: PartnershipStatus.ACTIVE,
    duration: '7 years',
    resources: 'SAR 100,000,000 investment, national digital infrastructure, and AI development platforms',
    expectedOutcomes: '100% digital government services, improved citizen experience, and global recognition as digital government leader.',
  },
  {
    title: 'Green Saudi Climate Technology Partnership',
    description: 'Multi-sector partnership focused on developing and deploying climate technologies to achieve Saudi Arabia\'s net-zero emissions by 2060.',
    participants: ['Green Saudi Initiative', 'Saudi Aramco', 'ACWA Power', 'KFUPM'],
    status: PartnershipStatus.ACTIVE,
    duration: '15 years',
    resources: 'SAR 200,000,000 climate fund, renewable energy infrastructure, and international technology partnerships',
    expectedOutcomes: '50% reduction in carbon emissions, establishment of major carbon capture facilities, and leadership in clean energy export.',
  },
  {
    title: 'Red Sea Marine Conservation Innovation Hub',
    description: 'Pioneering partnership combining luxury tourism with marine conservation using advanced monitoring and protection technologies.',
    participants: ['Red Sea Global', 'Saudi Wildlife Authority', 'Woods Hole Institute', 'Blue Economy Initiative'],
    status: PartnershipStatus.ACTIVE,
    duration: '10 years',
    resources: 'SAR 75,000,000 conservation fund, marine research vessels, and AI monitoring systems',
    expectedOutcomes: 'World\'s first regenerative tourism destination, 300% increase in marine biodiversity, and global marine conservation leadership.',
  },
  {
    title: 'Saudi Space Economy Development Consortium',
    description: 'Strategic alliance to establish Saudi Arabia as a regional space technology leader through satellite manufacturing and space services.',
    participants: ['Saudi Space Commission', 'KACST', 'STDIC', 'Thales Alenia Space'],
    status: PartnershipStatus.ACTIVE,
    duration: '8 years',
    resources: 'SAR 150,000,000 space development fund, satellite manufacturing facilities, and international space partnerships',
    expectedOutcomes: 'Launch of 20+ national satellites, establishment of regional satellite services, and creation of 5,000 high-tech jobs.',
  },
  {
    title: 'Entertainment and Media Technology Innovation Alliance',
    description: 'Collaborative initiative to position Saudi Arabia as a global entertainment technology hub supporting the growing entertainment sector.',
    participants: ['General Entertainment Authority', 'Saudi Film Commission', 'MiSK Art Institute', 'Netflix ME'],
    status: PartnershipStatus.PROPOSED,
    duration: '4 years',
    resources: 'SAR 30,000,000 creative technology fund, production facilities, and international distribution networks',
    expectedOutcomes: 'Production of 100+ local content pieces, establishment of entertainment technology cluster, and attraction of major international studios.',
  },
  {
    title: 'Women Entrepreneurship Ecosystem Partnership',
    description: 'Comprehensive support system for women entrepreneurs covering funding, mentorship, market access, and international expansion.',
    participants: ['Monshaat', 'Saudi Women Development Society', 'Khadijah Center', 'Endeavor Saudi'],
    status: PartnershipStatus.ACTIVE,
    duration: '6 years',
    resources: 'SAR 25,000,000 women entrepreneur fund, mentorship networks, and international market access programs',
    expectedOutcomes: 'Support for 1,000+ women-led startups, creation of 10,000 jobs for women, and establishment of regional women entrepreneurship hub.',
  },
  {
    title: 'Circular Economy Industrial Transformation Partnership',
    description: 'Large-scale industrial partnership to transform traditional manufacturing into circular economy models across multiple sectors.',
    participants: ['Saudi Industrial Dev Fund', 'SABIC', 'Maaden', 'Saudi Recycling Co', 'Ellen MacArthur Foundation'],
    status: PartnershipStatus.PROPOSED,
    duration: '10 years',
    resources: 'SAR 500,000,000 transformation fund, industrial infrastructure, and circular economy expertise',
    expectedOutcomes: '80% waste reduction in participating industries, creation of new circular economy business models, and establishment as regional circular economy leader.',
  }
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
  },
  {
    title: 'Desert-to-Cloud Data Centers',
    description: 'Sustainable data centers in Saudi desert regions using solar power and innovative cooling systems, providing cloud services while minimizing environmental impact.',
    category: 'Technology',
    stage: IdeaStage.CONCEPT,
    targetAudience: 'Cloud service providers, government agencies, and tech companies requiring data storage',
    potentialImpact: 'Reduced carbon footprint of digital infrastructure while establishing Saudi Arabia as a regional digital hub',
    resourcesNeeded: 'Data center engineering expertise, renewable energy systems, and government partnerships',
    creatorEmail: 'sarah@neom.sa',
  },
  {
    title: 'Hajj and Umrah Smart Experience Platform',
    description: 'AI-powered platform providing personalized guidance, crowd management, and spiritual journey enhancement for pilgrims visiting Mecca and Medina.',
    category: 'Tourism',
    stage: IdeaStage.VALIDATED,
    targetAudience: 'Muslim pilgrims worldwide and Saudi religious tourism authorities',
    potentialImpact: 'Enhanced spiritual experience for millions of pilgrims while improving safety and operational efficiency',
    resourcesNeeded: 'AI development, religious consultation, crowd management expertise, and government collaboration',
    creatorEmail: 'faisal@entertainment.sa',
  },
  {
    title: 'Marine Plastic-to-Fuel Conversion Ships',
    description: 'Mobile platforms that collect ocean plastic waste and convert it into clean fuel using advanced pyrolysis technology, cleaning seas while producing energy.',
    category: 'Environment',
    stage: IdeaStage.CONCEPT,
    targetAudience: 'Marine conservation organizations, fuel companies, and coastal nations',
    potentialImpact: 'Significant reduction in ocean plastic pollution while creating sustainable fuel source',
    resourcesNeeded: 'Marine engineering, pyrolysis technology expertise, and international maritime partnerships',
    creatorEmail: 'nora@greeninitiative.sa',
  },
  {
    title: 'Camel-Inspired Desert Agriculture Robots',
    description: 'Biomimetic robots designed like camels that can navigate desert terrain to plant seeds, deliver water, and monitor crop health in extreme arid conditions.',
    category: 'Agriculture',
    stage: IdeaStage.PROTOTYPE,
    targetAudience: 'Desert agriculture companies and food security initiatives',
    potentialImpact: 'Expansion of agricultural production in previously unusable desert areas, enhancing food security',
    resourcesNeeded: 'Robotics engineering, biomimicry research, and agricultural technology integration',
    creatorEmail: 'khalid@space.sa',
  },
  {
    title: 'Cultural Heritage NFT Marketplace',
    description: 'Blockchain-based platform for creating, trading, and experiencing digital representations of Saudi cultural artifacts and historical sites as NFTs.',
    category: 'Technology',
    stage: IdeaStage.SCALING,
    targetAudience: 'Cultural institutions, collectors, tourists, and digital art enthusiasts',
    potentialImpact: 'Preservation and global sharing of Saudi cultural heritage while creating new revenue streams',
    resourcesNeeded: 'Blockchain development, cultural expertise, digital art creation, and international marketing',
    creatorEmail: 'fatima@aihealth.sa',
  },
  {
    title: 'Arabic Language AI Medical Assistant',
    description: 'Advanced AI system specifically trained in Arabic medical terminology and Saudi healthcare protocols to assist doctors and patients with diagnosis and treatment recommendations.',
    category: 'Healthcare',
    stage: IdeaStage.VALIDATED,
    targetAudience: 'Healthcare providers in Arabic-speaking regions and medical students',
    potentialImpact: 'Improved healthcare access and quality in Arabic-speaking communities globally',
    resourcesNeeded: 'Medical AI expertise, Arabic language processing, and healthcare data partnerships',
    creatorEmail: 'amira@healthtech.sa',
  },
  {
    title: 'Modular Floating Solar Farms for Red Sea',
    description: 'Innovative floating solar panel systems designed for marine environments, providing clean energy while minimizing impact on marine ecosystems.',
    category: 'Energy',
    stage: IdeaStage.CONCEPT,
    targetAudience: 'Coastal energy companies, marine development projects, and island communities',
    potentialImpact: 'Massive clean energy generation without using valuable land resources',
    resourcesNeeded: 'Marine engineering, solar technology, and environmental impact assessment expertise',
    creatorEmail: 'mohammed@kaust.edu.sa',
  },
  {
    title: 'Space Debris to Satellite Manufacturing',
    description: 'Technology to capture and recycle space debris into raw materials for manufacturing new satellites, addressing the space junk problem while reducing launch costs.',
    category: 'Space Technology',
    stage: IdeaStage.CONCEPT,
    targetAudience: 'Space agencies, satellite manufacturers, and space debris management organizations',
    potentialImpact: 'Cleaning Earth\'s orbital environment while creating sustainable satellite manufacturing',
    resourcesNeeded: 'Space technology expertise, orbital mechanics, and international space cooperation',
    creatorEmail: 'khalid@space.sa',
  },
  {
    title: 'Virtual Reality Therapy for PTSD',
    description: 'Culturally-sensitive VR therapy platform designed specifically for Arabic-speaking patients dealing with PTSD and anxiety disorders.',
    category: 'Healthcare',
    stage: IdeaStage.VALIDATED,
    targetAudience: 'Mental health professionals, hospitals, and patients in the MENA region',
    potentialImpact: 'Improved mental health treatment outcomes while addressing cultural barriers to therapy',
    resourcesNeeded: 'VR development, clinical psychology expertise, and cultural consultation',
    creatorEmail: 'reem@circular.sa',
  }
];

// ========== COLLABORATION SEED DATA ==========
const collaborationSeedData = [
  {
    title: 'NEOM Smart City AI Infrastructure',
    description: 'Developing AI-powered smart city infrastructure for NEOM, including traffic management, energy optimization, and citizen services integration.',
    type: CollaborationType.PROJECT,
    status: CollaborationStatus.ACTIVE,
    tags: ['Demo', 'ai', 'smart-city', 'neom', 'infrastructure', 'saudi-vision-2030'],
    startDate: '2024-01-15',
    endDate: '2025-12-31',
    progressValue: 35,
    ownerEmail: 'khalid@aramco.com',
    teamMembers: ['Khalid Al-Saud', 'Ahmed Al-Farsi', 'Fatima Al-Zahrani'],
    requirements: {
      budget: 'SAR 50,000,000',
      timeline: '24 months',
      expertise: ['AI Development', 'IoT Systems', 'Urban Planning', 'Data Analytics']
    },
    resources: {
      funding: 'SAR 50M provided by Saudi Aramco and NEOM',
      infrastructure: 'NEOM testing facilities and data centers',
      partnerships: ['KAUST research labs', 'International AI consultants']
    },
    visibility: 'public'
  },
  {
    title: 'Desert Agriculture Innovation Program',
    description: 'A collaborative research initiative to develop sustainable agriculture solutions for arid environments using advanced biotechnology and water management systems.',
    type: CollaborationType.RESEARCH,
    status: CollaborationStatus.ACTIVE,
    tags: ['Demo', 'agriculture', 'sustainability', 'biotech', 'water-management', 'food-security'],
    startDate: '2024-03-01',
    endDate: '2026-02-28',
    progressValue: 20,
    ownerEmail: 'mohammed@kaust.edu.sa',
    teamMembers: ['Dr. Mohammed Al-Qahtani', 'Layla Ibrahim', 'Ahmed Al-Farsi'],
    requirements: {
      budget: 'SAR 15,000,000',
      timeline: '24 months',
      expertise: ['Biotechnology', 'Agricultural Engineering', 'Water Systems', 'Environmental Science']
    },
    resources: {
      funding: 'KAUST research grant and Ministry of Environment funding',
      facilities: 'Desert research stations, lab equipment, field testing sites',
      partnerships: ['International agricultural research institutes']
    },
    visibility: 'public'
  },
  {
    title: 'FinTech Accelerator Program 2024',
    description: 'A comprehensive accelerator program for fintech startups focusing on Islamic finance, digital payments, and financial inclusion in Saudi Arabia.',
    type: CollaborationType.PROGRAM,
    status: CollaborationStatus.ACTIVE,
    tags: ['Demo', 'fintech', 'acceleration', 'islamic-finance', 'financial-inclusion', 'startups'],
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    progressValue: 60,
    ownerEmail: 'accelerator@example.com',
    teamMembers: ['Nadia Al-Qahtani', 'Saad Al-Faisal', 'Youssef Al-Hamdan'],
    requirements: {
      budget: 'SAR 10,000,000',
      timeline: '10 months',
      expertise: ['Financial Technology', 'Islamic Banking', 'Regulatory Compliance', 'Digital Marketing']
    },
    resources: {
      funding: 'Venture capital and government grants',
      mentorship: '50+ industry experts and successful entrepreneurs',
      networks: 'Banking partnerships and regulatory sandbox access'
    },
    visibility: 'public'
  },
  {
    title: 'Women in Tech Leadership Initiative',
    description: 'Empowering women entrepreneurs and technologists in Saudi Arabia through mentorship, funding opportunities, and leadership development programs.',
    type: CollaborationType.INITIATIVE,
    status: CollaborationStatus.ACTIVE,
    tags: ['Demo', 'women-in-tech', 'leadership', 'entrepreneurship', 'mentorship', 'gender-equality'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    progressValue: 45,
    ownerEmail: 'fatima@aihealth.sa',
    teamMembers: ['Fatima Al-Zahrani', 'Layla Ibrahim', 'Nadia Al-Qahtani'],
    requirements: {
      budget: 'SAR 5,000,000',
      timeline: '12 months',
      expertise: ['Technology Leadership', 'Business Development', 'Mentorship', 'Community Building']
    },
    resources: {
      funding: 'Government and private sector support',
      mentors: 'International and local women tech leaders',
      platforms: 'Online learning and networking platforms'
    },
    visibility: 'public'
  },
  {
    title: 'Green Hydrogen Production Research',
    description: 'Developing cost-effective green hydrogen production methods using solar energy for Saudi Arabia\'s clean energy transition.',
    type: CollaborationType.RESEARCH,
    status: CollaborationStatus.ACTIVE,
    tags: ['Demo', 'green-hydrogen', 'renewable-energy', 'solar', 'clean-energy', 'sustainability'],
    startDate: '2024-04-01',
    endDate: '2027-03-31',
    progressValue: 15,
    ownerEmail: 'mohammed@kaust.edu.sa',
    teamMembers: ['Dr. Mohammed Al-Qahtani', 'Khalid Al-Saud', 'Omar Al-Amoudi'],
    requirements: {
      budget: 'SAR 75,000,000',
      timeline: '36 months',
      expertise: ['Chemical Engineering', 'Solar Technology', 'Industrial Process Design', 'Energy Storage']
    },
    resources: {
      funding: 'Saudi Aramco R&D and KACST grants',
      facilities: 'Specialized laboratories and pilot plant facilities',
      partnerships: ['International energy research institutes', 'Technology transfer programs']
    },
    visibility: 'limited'
  },
  {
    title: 'Healthcare AI Diagnostics Commercialization',
    description: 'Commercializing AI-powered diagnostic tools for early detection of chronic diseases in Saudi healthcare system.',
    type: CollaborationType.INVESTMENT,
    status: CollaborationStatus.ACTIVE,
    tags: ['Demo', 'healthcare', 'ai', 'diagnostics', 'commercialization', 'investment'],
    startDate: '2024-02-15',
    endDate: '2025-08-15',
    progressValue: 55,
    ownerEmail: 'saad@svc.sa',
    teamMembers: ['Saad Al-Faisal', 'Fatima Al-Zahrani', 'Dr. Mohammed Al-Qahtani'],
    requirements: {
      budget: 'SAR 25,000,000',
      timeline: '18 months',
      expertise: ['Medical AI', 'Regulatory Affairs', 'Clinical Testing', 'Business Development']
    },
    resources: {
      funding: 'Venture capital and strategic investors',
      partnerships: 'Major hospitals for pilot testing',
      expertise: 'Medical professionals and AI specialists'
    },
    visibility: 'limited'
  },
  {
    title: 'Circular Economy Manufacturing Hub',
    description: 'Establishing a circular economy manufacturing hub that converts waste materials into valuable products, supporting Saudi Arabia\'s sustainability goals.',
    type: CollaborationType.PROJECT,
    status: CollaborationStatus.DRAFT,
    tags: ['Demo', 'circular-economy', 'manufacturing', 'sustainability', 'waste-management', 'innovation'],
    startDate: '2024-06-01',
    endDate: '2026-05-31',
    progressValue: 5,
    ownerEmail: 'abdullah@mcit.gov.sa',
    teamMembers: ['Abdullah Al-Otaibi', 'Ahmed Al-Farsi', 'Omar Al-Amoudi'],
    requirements: {
      budget: 'SAR 40,000,000',
      timeline: '24 months',
      expertise: ['Manufacturing Engineering', 'Waste Management', 'Product Design', 'Supply Chain Management']
    },
    resources: {
      funding: 'Government and private sector co-investment',
      infrastructure: 'Industrial land and manufacturing equipment',
      partnerships: ['Local manufacturers and waste management companies']
    },
    visibility: 'public'
  },
  {
    title: 'Digital Arts and Cultural Heritage Preservation',
    description: 'Using advanced digital technologies to preserve and showcase Saudi cultural heritage through immersive experiences and virtual museums.',
    type: CollaborationType.PROJECT,
    status: CollaborationStatus.ACTIVE,
    tags: ['Demo', 'cultural-heritage', 'digital-arts', 'vr', 'preservation', 'tourism'],
    startDate: '2024-03-15',
    endDate: '2025-09-15',
    progressValue: 40,
    ownerEmail: 'fatima@aihealth.sa',
    teamMembers: ['Fatima Al-Zahrani', 'Youssef Al-Hamdan', 'Tariq Al-Mansour'],
    requirements: {
      budget: 'SAR 12,000,000',
      timeline: '18 months',
      expertise: ['3D Modeling', 'VR Development', 'Cultural Studies', 'Museum Technology']
    },
    resources: {
      funding: 'Ministry of Culture and tourism sector support',
      artifacts: 'Access to historical sites and cultural collections',
      technology: 'Advanced 3D scanning and VR development tools'
    },
    visibility: 'public'
  }
];

// ========== MATCH SEED DATA ==========
const matchSeedData = [
  {
    userEmail: 'ahmed@techstartup.sa',
    targetUserEmail: 'mohammed@kaust.edu.sa',
    matchScore: 0.92,
    sharedTags: ['Demo', 'sustainability', 'technology', 'research', 'innovation'],
    highlight: 'Both focused on sustainable technology solutions with complementary expertise in practical implementation and research'
  },
  {
    userEmail: 'fatima@aihealth.sa',
    targetUserEmail: 'saad@svc.sa',
    matchScore: 0.88,
    sharedTags: ['Demo', 'ai', 'healthcare', 'technology', 'investment'],
    highlight: 'AI healthcare innovation expertise meets venture capital funding for medical technology commercialization'
  },
  {
    userEmail: 'khalid@aramco.com',
    targetUserEmail: 'abdullah@mcit.gov.sa',
    matchScore: 0.85,
    sharedTags: ['Demo', 'digital', 'transformation', 'innovation', 'vision2030'],
    highlight: 'Corporate digital transformation experience aligns with government digitalization initiatives'
  },
  {
    userEmail: 'layla@ksu.edu.sa',
    targetUserEmail: 'ahmed@techstartup.sa',
    matchScore: 0.90,
    sharedTags: ['Demo', 'biotech', 'research', 'sustainability', 'agriculture'],
    highlight: 'Biotechnology research expertise perfectly complements sustainable agriculture technology development'
  },
  {
    userEmail: 'accelerator@example.com',
    targetUserEmail: 'youssef@gmail.com',
    matchScore: 0.83,
    sharedTags: ['Demo', 'entrepreneurship', 'startups', 'fintech', 'funding'],
    highlight: 'Startup acceleration programs align with experienced entrepreneur in fintech sector'
  },
  {
    userEmail: 'omar@kacst.org',
    targetUserEmail: 'mohammed@kaust.edu.sa',
    matchScore: 0.87,
    sharedTags: ['Demo', 'research', 'science', 'technology', 'innovation'],
    highlight: 'Government research administration expertise complements university research capabilities'
  }
];

// ========== CONNECTION SEED DATA ==========
const connectionSeedData = [
  {
    requesterEmail: 'ahmed@techstartup.sa',
    receiverEmail: 'mohammed@kaust.edu.sa',
    status: ConnectionStatus.ACCEPTED
  },
  {
    requesterEmail: 'fatima@aihealth.sa',
    receiverEmail: 'saad@svc.sa',
    status: ConnectionStatus.ACCEPTED
  },
  {
    requesterEmail: 'khalid@aramco.com',
    receiverEmail: 'abdullah@mcit.gov.sa',
    status: ConnectionStatus.ACCEPTED
  },
  {
    requesterEmail: 'layla@ksu.edu.sa',
    receiverEmail: 'ahmed@techstartup.sa',
    status: ConnectionStatus.PENDING
  },
  {
    requesterEmail: 'accelerator@example.com',
    receiverEmail: 'youssef@gmail.com',
    status: ConnectionStatus.ACCEPTED
  },
  {
    requesterEmail: 'incubator@example.com',
    receiverEmail: 'fatima@aihealth.sa',
    status: ConnectionStatus.ACCEPTED
  }
];

// ========== MESSAGE SEED DATA ==========
const messageSeedData = [
  {
    senderEmail: 'ahmed@techstartup.sa',
    receiverEmail: 'mohammed@kaust.edu.sa',
    content: 'Hi Dr. Al-Qahtani, I saw your work on solar technology applications in desert environments. Our startup is working on sustainable urban solutions and I believe there could be great synergy between our projects. Would you be interested in discussing a potential collaboration?',
    isRead: true
  },
  {
    senderEmail: 'mohammed@kaust.edu.sa',
    receiverEmail: 'ahmed@techstartup.sa',
    content: 'Hello Ahmed, thank you for reaching out! Your work on sustainable technology solutions is very impressive. I would definitely be interested in exploring collaboration opportunities. Our desert agriculture research could benefit from your practical implementation expertise. Shall we schedule a meeting?',
    isRead: true
  },
  {
    senderEmail: 'fatima@aihealth.sa',
    receiverEmail: 'saad@svc.sa',
    content: 'Dear Mr. Al-Faisal, we have made significant progress on our AI diagnostic platform and are now ready to discuss Series A funding. Our pilot results show 94% accuracy in early chronic disease detection. I would love to present our progress and discuss investment opportunities.',
    isRead: false
  },
  {
    senderEmail: 'accelerator@example.com',
    receiverEmail: 'youssef@gmail.com',
    content: 'Youssef, your experience in e-commerce and fintech makes you an ideal mentor for our upcoming accelerator cohort. We have several startups that could benefit from your expertise. Would you be interested in joining our mentor network?',
    isRead: true
  }
];

// ========== NOTIFICATION SEED DATA ==========
const notificationSeedData = [
  {
    userEmail: 'ahmed@techstartup.sa',
    type: NotificationType.CONNECTION,
    content: 'Dr. Mohammed Al-Qahtani accepted your connection request',
    isRead: true
  },
  {
    userEmail: 'mohammed@kaust.edu.sa',
    type: NotificationType.MESSAGE,
    content: 'You have a new message from Ahmed Al-Farsi regarding sustainable technology collaboration',
    isRead: true
  },
  {
    userEmail: 'fatima@aihealth.sa',
    type: NotificationType.INTEREST,
    content: 'Saad Al-Faisal showed interest in your AI Healthcare Diagnostics project',
    isRead: false
  },
  {
    userEmail: 'saad@svc.sa',
    type: NotificationType.MESSAGE,
    content: 'New message from Fatima Al-Zahrani about Series A funding opportunity',
    isRead: false
  },
  {
    userEmail: 'youssef@gmail.com',
    type: NotificationType.SYSTEM,
    content: 'You have been invited to join the Riyadh Accelerator mentor network',
    isRead: false
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
      // Handle participants array by using direct database insert with proper PostgreSQL array syntax
      const participants = Array.isArray(partnershipData.participants) ? partnershipData.participants : [];
      
      // Use raw query to insert partnership with proper array handling
      const insertResult = await partnershipRepository.query(
        'INSERT INTO partnerships (id, title, description, participants, status, duration, resources, \"expectedOutcomes\", initiator_id, partner_id) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [
          partnershipData.title,
          partnershipData.description,
          participants,
          partnershipData.status,
          partnershipData.duration,
          partnershipData.resources,
          partnershipData.expectedOutcomes,
          adminUser.id,
          adminUser.id
        ]
      );
      
      logger.info(`Created partnership via raw query: ${partnershipData.title}`);
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
 * Seed collaborations
 */
const seedCollaborations = async (): Promise<void> => {
  try {
    logger.info('Seeding collaborations...');
    
    const collaborationRepository = AppDataSource.getRepository(Collaboration);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if collaborations already exist
    const existingCollaborationsCount = await collaborationRepository.count();
    if (existingCollaborationsCount > 0) {
      logger.info(`${existingCollaborationsCount} collaborations already exist in the database. Skipping seed.`);
      return;
    }
    
    // Create collaborations
    for (const collabData of collaborationSeedData) {
      // Find the owner user
      const owner = await userRepository.findOne({
        where: { email: collabData.ownerEmail }
      });
      
      if (!owner) {
        logger.warn(`Owner with email ${collabData.ownerEmail} not found. Skipping collaboration: ${collabData.title}`);
        continue;
      }
      
      // Create the collaboration (using actual database schema)
      const collaboration = new Collaboration();
      collaboration.title = collabData.title;
      collaboration.description = collabData.description;
      collaboration.status = collabData.status;
      collaboration.ownerId = owner.id;
      collaboration.teamMembers = collabData.teamMembers;
      
      await collaborationRepository.save(collaboration);
      logger.info(`Created collaboration: ${collaboration.title}`);
    }
    
    logger.info(`Successfully seeded ${collaborationSeedData.length} collaborations`);
  } catch (error) {
    logger.error('Error seeding collaborations:', error);
  }
};

/**
 * Seed matches
 */
const seedMatches = async (): Promise<void> => {
  try {
    logger.info('Seeding matches...');
    
    const matchRepository = AppDataSource.getRepository(Match);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if matches already exist
    const existingMatchesCount = await matchRepository.count();
    if (existingMatchesCount > 0) {
      logger.info(`${existingMatchesCount} matches already exist in the database. Skipping seed.`);
      return;
    }
    
    // Create matches
    for (const matchData of matchSeedData) {
      // Find the users
      const user = await userRepository.findOne({
        where: { email: matchData.userEmail }
      });
      const targetUser = await userRepository.findOne({
        where: { email: matchData.targetUserEmail }
      });
      
      if (!user || !targetUser) {
        logger.warn(`User not found for match. Skipping match between ${matchData.userEmail} and ${matchData.targetUserEmail}`);
        continue;
      }
      
      // Create the match
      const match = new Match();
      match.userId = user.id;
      match.targetUserId = targetUser.id;
      match.matchScore = matchData.matchScore;
      match.sharedTags = matchData.sharedTags;
      match.highlight = matchData.highlight;
      match.preference = 'pending';
      
      await matchRepository.save(match);
      logger.info(`Created match: ${user.firstName} ${user.lastName} <-> ${targetUser.firstName} ${targetUser.lastName}`);
    }
    
    logger.info(`Successfully seeded ${matchSeedData.length} matches`);
  } catch (error) {
    logger.error('Error seeding matches:', error);
  }
};

/**
 * Seed connections
 */
const seedConnections = async (): Promise<void> => {
  try {
    logger.info('Seeding connections...');
    
    const connectionRepository = AppDataSource.getRepository(Connection);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if connections already exist
    const existingConnectionsCount = await connectionRepository.count();
    if (existingConnectionsCount > 0) {
      logger.info(`${existingConnectionsCount} connections already exist in the database. Skipping seed.`);
      return;
    }
    
    // Create connections
    for (const connectionData of connectionSeedData) {
      // Find the users
      const requester = await userRepository.findOne({
        where: { email: connectionData.requesterEmail }
      });
      const receiver = await userRepository.findOne({
        where: { email: connectionData.receiverEmail }
      });
      
      if (!requester || !receiver) {
        logger.warn(`User not found for connection. Skipping connection between ${connectionData.requesterEmail} and ${connectionData.receiverEmail}`);
        continue;
      }
      
      // Create the connection
      const connection = new Connection();
      connection.requesterId = requester.id;
      connection.receiverId = receiver.id;
      connection.status = connectionData.status;
      
      await connectionRepository.save(connection);
      logger.info(`Created connection: ${requester.firstName} ${requester.lastName} -> ${receiver.firstName} ${receiver.lastName} (${connectionData.status})`);
    }
    
    logger.info(`Successfully seeded ${connectionSeedData.length} connections`);
  } catch (error) {
    logger.error('Error seeding connections:', error);
  }
};

/**
 * Seed messages
 */
const seedMessages = async (): Promise<void> => {
  try {
    logger.info('Seeding messages...');
    
    const messageRepository = AppDataSource.getRepository(Message);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if messages already exist
    const existingMessagesCount = await messageRepository.count();
    if (existingMessagesCount > 0) {
      logger.info(`${existingMessagesCount} messages already exist in the database. Skipping seed.`);
      return;
    }
    
    // Create messages
    for (const messageData of messageSeedData) {
      // Find the users
      const sender = await userRepository.findOne({
        where: { email: messageData.senderEmail }
      });
      const receiver = await userRepository.findOne({
        where: { email: messageData.receiverEmail }
      });
      
      if (!sender || !receiver) {
        logger.warn(`User not found for message. Skipping message from ${messageData.senderEmail} to ${messageData.receiverEmail}`);
        continue;
      }
      
      // Create the message
      const message = new Message();
      message.senderId = sender.id;
      message.receiverId = receiver.id;
      message.content = messageData.content;
      message.isRead = messageData.isRead;
      
      await messageRepository.save(message);
      logger.info(`Created message: ${sender.firstName} ${sender.lastName} -> ${receiver.firstName} ${receiver.lastName}`);
    }
    
    logger.info(`Successfully seeded ${messageSeedData.length} messages`);
  } catch (error) {
    logger.error('Error seeding messages:', error);
  }
};

/**
 * Seed notifications
 */
const seedNotifications = async (): Promise<void> => {
  try {
    logger.info('Seeding notifications...');
    
    const notificationRepository = AppDataSource.getRepository(Notification);
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if notifications already exist
    const existingNotificationsCount = await notificationRepository.count();
    if (existingNotificationsCount > 0) {
      logger.info(`${existingNotificationsCount} notifications already exist in the database. Skipping seed.`);
      return;
    }
    
    // Create notifications
    for (const notificationData of notificationSeedData) {
      // Find the user
      const user = await userRepository.findOne({
        where: { email: notificationData.userEmail }
      });
      
      if (!user) {
        logger.warn(`User not found for notification. Skipping notification for ${notificationData.userEmail}`);
        continue;
      }
      
      // Create the notification
      const notification = new Notification();
      notification.userId = user.id;
      notification.type = notificationData.type;
      notification.content = notificationData.content;
      notification.isRead = notificationData.isRead;
      
      await notificationRepository.save(notification);
      logger.info(`Created notification: ${notificationData.type} for ${user.firstName} ${user.lastName}`);
    }
    
    logger.info(`Successfully seeded ${notificationSeedData.length} notifications`);
  } catch (error) {
    logger.error('Error seeding notifications:', error);
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
    
    // Seed new entities for enhanced platform functionality
    // Note: Some entities have schema mismatches, seeding only compatible ones
    // await seedCollaborations(); // Schema mismatch: missing 'type' column
    // await seedMatches(); // Schema mismatch: database has user1Id/user2Id vs userId/targetUserId
    // await seedConnections(); // Schema mismatch: column name casing
    await seedMessages();
    await seedNotifications();
    
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