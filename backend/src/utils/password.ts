import * as bcryptjs from 'bcryptjs';
import logger from './logger';
import crypto from 'crypto';

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
    // Use bcryptjs for production
    try {
      const salt = await bcryptjs.genSalt(SALT_ROUNDS);
      return await bcryptjs.hash(password, salt);
    } catch (error) {
      console.error('Error hashing password:', error);
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
      // Use bcryptjs for production
      return await bcryptjs.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      // Fallback to simple verification
      const hashed = crypto.createHash('sha256').update(password).digest('hex');
      return hashed === hashedPassword;
    }
  }
}
