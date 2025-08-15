import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';
import { Collaboration } from '../entities/Collaboration';
import { Milestone } from '../entities/Milestone';

// Load environment variables
dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DATABASE_URL, NODE_ENV } =
  process.env;

// Determine if synchronize should be enabled based on environment variables
// This allows more control over when schema synchronization happens
const shouldSynchronize = NODE_ENV === 'development' && process.env.DB_SYNC === 'true';

// Use DATABASE_URL if provided, otherwise use individual connection parameters
export const AppDataSource = new DataSource(
  DATABASE_URL
    ? {
        type: 'postgres',
        url: DATABASE_URL,
        synchronize: shouldSynchronize,
        logging: NODE_ENV === 'development' ? ['error', 'warn'] : false,
        entities: [path.join(__dirname, '../entities/**/*.{ts,js}'), Collaboration, Milestone],
        migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
        subscribers: [path.join(__dirname, '../subscribers/**/*.{ts,js}')],
        cache: true,
        poolSize: 10,
        maxQueryExecutionTime: 1000,
        connectTimeoutMS: 10000,
      }
    : {
        type: 'postgres',
        host: DB_HOST || 'localhost',
        port: parseInt(DB_PORT || '5432', 10),
        username: DB_USERNAME || 'postgres',
        password: DB_PASSWORD || 'postgres',
        database: DB_DATABASE || 'sanad_db',
        synchronize: shouldSynchronize,
        logging: NODE_ENV === 'development' ? ['error', 'warn'] : false,
        entities: [path.join(__dirname, '../entities/**/*.{ts,js}'), Collaboration, Milestone],
        migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
        subscribers: [path.join(__dirname, '../subscribers/**/*.{ts,js}')],
        cache: true,
        poolSize: 10,
        maxQueryExecutionTime: 1000,
        connectTimeoutMS: 10000,
      }
);

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');

    if (shouldSynchronize) {
      logger.warn(
        'Database schema synchronization is enabled. This should be disabled in production.'
      );
    }
  } catch (error) {
    logger.error(`Database connection failed: ${error}`);
    throw error;
  }
};
