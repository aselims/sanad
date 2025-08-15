import dotenv from 'dotenv';
import { developmentConfig } from './environments/development';
import { productionConfig } from './environments/production';
import { testConfig } from './environments/test';

// Load environment variables from .env files
dotenv.config();

// Environment type for better type safety
export type Environment = 'development' | 'production' | 'test';

// Configuration interface with all required environment variables
export interface AppConfig {
  // Server Configuration
  port: number;
  nodeEnv: Environment;
  
  // Database Configuration
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    url?: string;
    syncEnabled: boolean;
  };
  
  // JWT Configuration
  jwt: {
    secret: string;
    expiresIn: string;
  };
  
  // API Keys
  apiKeys: {
    openai: string;
  };
  
  // Application Configuration
  app: {
    corsOrigin: string;
    logLevel: string;
  };
}

// Validation functions
const _validateRequired = (value: string | undefined, name: string): string => {
  if (!value || value.trim() === '') {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value.trim();
};

const validatePort = (value: string | undefined, defaultPort: number): number => {
  if (!value) return defaultPort;
  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${value}`);
  }
  return port;
};

const validateEnvironment = (value: string | undefined): Environment => {
  const env = value || 'development';
  if (!['development', 'production', 'test'].includes(env)) {
    throw new Error(`Invalid NODE_ENV: ${env}. Must be development, production, or test`);
  }
  return env as Environment;
};

const validateBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Get environment-specific configuration defaults
const getEnvironmentDefaults = (env: Environment): Partial<AppConfig> => {
  switch (env) {
    case 'development':
      return developmentConfig;
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      return {};
  }
};

// Merge configurations with environment variables taking precedence
const mergeConfig = (defaults: Partial<AppConfig>, overrides: Partial<AppConfig>): AppConfig => {
  return {
    port: overrides.port || defaults.port || 3000,
    nodeEnv: overrides.nodeEnv || defaults.nodeEnv || 'development',
    
    database: {
      host: overrides.database?.host || defaults.database?.host || 'localhost',
      port: overrides.database?.port || defaults.database?.port || 5432,
      username: overrides.database?.username || defaults.database?.username || 'postgres',
      password: overrides.database?.password || defaults.database?.password || 'postgres',
      database: overrides.database?.database || defaults.database?.database || 'sanad_db',
      url: overrides.database?.url || defaults.database?.url,
      syncEnabled: overrides.database?.syncEnabled !== undefined 
        ? overrides.database.syncEnabled 
        : defaults.database?.syncEnabled || false,
    },
    
    jwt: {
      secret: overrides.jwt?.secret || defaults.jwt?.secret || 'default-secret',
      expiresIn: overrides.jwt?.expiresIn || defaults.jwt?.expiresIn || '1d',
    },
    
    apiKeys: {
      openai: overrides.apiKeys?.openai || defaults.apiKeys?.openai || 'placeholder',
    },
    
    app: {
      corsOrigin: overrides.app?.corsOrigin || defaults.app?.corsOrigin || 'http://localhost:8081',
      logLevel: overrides.app?.logLevel || defaults.app?.logLevel || 'info',
    },
  } as AppConfig;
};

// Create and validate configuration
const createConfig = (): AppConfig => {
  const nodeEnv = validateEnvironment(process.env.NODE_ENV);
  
  // Get environment-specific defaults
  const envDefaults = getEnvironmentDefaults(nodeEnv);
  
  // Environment variable overrides
  const envOverrides: Partial<AppConfig> = {
    port: process.env.PORT ? validatePort(process.env.PORT, 3000) : undefined,
    nodeEnv,
    
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? validatePort(process.env.DB_PORT, 5432) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      url: process.env.DATABASE_URL,
      syncEnabled: process.env.DB_SYNC ? validateBoolean(process.env.DB_SYNC, false) : undefined,
    },
    
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
    },
    
    app: {
      corsOrigin: process.env.CORS_ORIGIN,
      logLevel: process.env.LOG_LEVEL,
    },
  };
  
  // Merge configurations
  const config = mergeConfig(envDefaults, envOverrides);
  
  // Production-specific validations
  if (nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    
    if (config.jwt.secret === 'your_jwt_secret_key_change_in_production' || 
        config.jwt.secret === 'default-secret' ||
        config.jwt.secret === 'development-jwt-secret-not-for-production') {
      throw new Error('JWT_SECRET must be changed from default value in production');
    }
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required in production');
    }
    
    if (config.database.syncEnabled) {
      throw new Error('Database synchronization must be disabled in production');
    }
  }
  
  return config;
};

// Export singleton configuration instance
export const config = createConfig();

// Export validation function for testing
export const validateConfig = (): void => {
  createConfig();
};

// Helper function to check if we're in a specific environment
export const isDevelopment = (): boolean => config.nodeEnv === 'development';
export const isProduction = (): boolean => config.nodeEnv === 'production';
export const isTest = (): boolean => config.nodeEnv === 'test';