import bcrypt from 'bcrypt';
import logger from './logger';

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error(`Error hashing password: ${error}`);
    throw new Error('Error hashing password');
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns Boolean indicating if the passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(`Error comparing passwords: ${error}`);
    throw new Error('Error comparing passwords');
  }
}; 