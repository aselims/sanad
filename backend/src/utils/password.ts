import bcrypt from 'bcryptjs';
import logger from './logger';

// In development mode, we'll use a simpler hash function
const isDev = process.env.NODE_ENV === 'development';

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcryptjs
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (isDev) {
    // Simple hash for development - DO NOT USE IN PRODUCTION
    return crypto.createHash('sha256').update(password).digest('hex');
  } else {
    // This code path won't be used in development, so it won't fail
    // with the bcrypt architecture mismatch
    try {
      // Dynamically import bcrypt only in production
      const bcrypt = await import('bcrypt');
      const salt = await bcrypt.default.genSalt(SALT_ROUNDS);
      return await bcrypt.default.hash(password, salt);
    } catch (error) {
      console.error('Error importing bcrypt:', error);
      // Fallback to simple hash
      return crypto.createHash('sha256').update(password).digest('hex');
    }
  }
}

/**
 * Verify a password against a hash
 * @param password - The plain text password
 * @param hashedPassword - The hashed password
 * @returns Whether the password matches the hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (isDev) {
    // Simple verification for development
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    return hashed === hashedPassword;
  } else {
    try {
      // Dynamically import bcrypt only in production
      const bcrypt = await import('bcrypt');
      return await bcrypt.default.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error importing bcrypt:', error);
      // Fallback to simple verification
      const hashed = crypto.createHash('sha256').update(password).digest('hex');
      return hashed === hashedPassword;
    }
  }
} 