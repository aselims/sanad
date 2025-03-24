import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';
import { Collaboration } from '../entities/Collaboration';
import { Milestone } from '../entities/Milestone';

// Load environment variables
dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  NODE_ENV,
} = process.env;

// Determine if synchronize should be enabled based on environment variables
// This allows more control over when schema synchronization happens
const shouldSynchronize = NODE_ENV === 'development' && process.env.DB_SYNC === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT || '5432', 10),
  username: DB_USERNAME || 'postgres',
  password: DB_PASSWORD || 'postgres',
  database: DB_DATABASE || 'sanad_db',
  synchronize: shouldSynchronize, // Only synchronize when explicitly enabled
  logging: NODE_ENV === 'development' ? ['error', 'warn'] : false, // Reduce logging in development
  entities: [
    path.join(__dirname, '../entities/**/*.{ts,js}'),
    Collaboration,
    Milestone
  ],
  migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
  subscribers: [path.join(__dirname, '../subscribers/**/*.{ts,js}')],
  // Add performance optimizations
  cache: true,
  poolSize: 10, // Adjust based on your needs
  maxQueryExecutionTime: 1000, // Log slow queries (>1000ms)
  connectTimeoutMS: 10000,
});

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');
    
    if (shouldSynchronize) {
      logger.warn('Database schema synchronization is enabled. This should be disabled in production.');
    }
  } catch (error) {
    logger.error(`Database connection failed: ${error}`);
    throw error;
  }
}; 