import { AppConfig } from '../config';

type PartialAppConfig = {
  database?: Partial<AppConfig['database']>;
  jwt?: Partial<AppConfig['jwt']>;
  app?: Partial<AppConfig['app']>;
  port?: number;
  nodeEnv?: AppConfig['nodeEnv'];
  apiKeys?: Partial<AppConfig['apiKeys']>;
};

export const testConfig: PartialAppConfig = {
  // Server Configuration
  port: 3001,
  
  // Database Configuration
  database: {
    database: 'sanad_test_db',
    syncEnabled: true, // Enable for test database setup
  },
  
  // JWT Configuration
  jwt: {
    secret: 'test-jwt-secret',
    expiresIn: '1h', // Short expiry for tests
  },
  
  // API Keys
  apiKeys: {
    openai: 'test-placeholder',
  },
  
  // Application Configuration
  app: {
    corsOrigin: 'http://localhost:3000',
    logLevel: 'warn', // Minimal logging in tests
  },
};