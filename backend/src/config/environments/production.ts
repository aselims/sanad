import { AppConfig } from '../config';

type PartialAppConfig = {
  database?: Partial<AppConfig['database']>;
  jwt?: Partial<AppConfig['jwt']>;
  app?: Partial<AppConfig['app']>;
  port?: number;
  nodeEnv?: AppConfig['nodeEnv'];
  apiKeys?: Partial<AppConfig['apiKeys']>;
};

export const productionConfig: PartialAppConfig = {
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