import { DataSource } from 'typeorm';
import path from 'path';
import logger from '../utils/logger';
import { config, isDevelopment } from './config';
import { Collaboration } from '../entities/Collaboration';
import { Milestone } from '../entities/Milestone';
import { UserSkill } from '../entities/UserSkill';
import { TeamInvitation } from '../entities/TeamInvitation';

// Use DATABASE_URL if provided, otherwise use individual connection parameters
export const AppDataSource = new DataSource(
  config.database.url
    ? {
        type: 'postgres',
        url: config.database.url,
        synchronize: config.database.syncEnabled,
        logging: isDevelopment() ? ['error', 'warn'] : false,
        entities: [
          path.join(__dirname, '../entities/**/*.{ts,js}'),
          Collaboration,
          Milestone,
          UserSkill,
          TeamInvitation,
        ],
        migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
        subscribers: [path.join(__dirname, '../subscribers/**/*.{ts,js}')],
        cache: true,
        poolSize: 10,
        maxQueryExecutionTime: 1000,
        connectTimeoutMS: 10000,
      }
    : {
        type: 'postgres',
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        synchronize: config.database.syncEnabled,
        logging: isDevelopment() ? ['error', 'warn'] : false,
        entities: [
          path.join(__dirname, '../entities/**/*.{ts,js}'),
          Collaboration,
          Milestone,
          UserSkill,
          TeamInvitation,
        ],
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

    if (config.database.syncEnabled) {
      logger.warn(
        'Database schema synchronization is enabled. This should be disabled in production.'
      );
    }
  } catch (error) {
    logger.error(`Database connection failed: ${error}`);
    throw error;
  }
};
