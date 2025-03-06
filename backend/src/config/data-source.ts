import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

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

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT || '5432', 10),
  username: DB_USERNAME || 'postgres',
  password: DB_PASSWORD || 'postgres',
  database: DB_DATABASE || 'sanad_db',
  synchronize: NODE_ENV === 'development', // Auto-create database schema in development
  logging: NODE_ENV === 'development',
  entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
  subscribers: [path.join(__dirname, '../subscribers/**/*.{ts,js}')],
});

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');
  } catch (error) {
    logger.error(`Database connection failed: ${error}`);
    throw error;
  }
}; 