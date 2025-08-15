import { AppConfig } from '../config';

export const developmentConfig: Partial<AppConfig> = {
  // Server Configuration
  port: 3000,
  
  // Database Configuration
  database: {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'sanad_db',
    syncEnabled: true, // Enable in development for auto-schema sync
  },
  
  // JWT Configuration
  jwt: {
    secret: 'development-jwt-secret-not-for-production',
    expiresIn: '7d', // Longer expiry for development
  },
  
  // API Keys
  apiKeys: {
    openai: 'development-placeholder', // Allow placeholder in development
  },
  
  // Application Configuration
  app: {
    corsOrigin: 'http://localhost:8081',
    logLevel: 'debug', // More verbose logging in development
  },
};