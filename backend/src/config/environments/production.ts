import { AppConfig } from '../config';

export const productionConfig: Partial<AppConfig> = {
  // Database Configuration
  database: {
    syncEnabled: false, // NEVER enable sync in production
  },
  
  // JWT Configuration
  jwt: {
    expiresIn: '1d', // Shorter expiry for production
  },
  
  // Application Configuration
  app: {
    logLevel: 'info', // Less verbose logging in production
  },
};