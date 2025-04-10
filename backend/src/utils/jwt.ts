import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../entities/User';
import logger from './logger';

// Get JWT secret from environment variables
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generate a JWT token for a user
 * @param user User object
 * @returns JWT token
 */
export const generateToken = (user: User): string => {
  try {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Create a simple object for the JWT options with the correct type
    const options: jwt.SignOptions = { 
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    };
    
    // Sign with properly typed parameters
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (error) {
    logger.error(`Error generating token: ${error}`);
    throw new Error('Error generating token');
  }
};

/**
 * Verify a JWT token
 * @param token JWT token
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.error(`Error verifying token: ${error}`);
    throw new Error('Invalid token');
  }
};

/**
 * Extract user ID from JWT token
 * @param token JWT token
 * @returns User ID
 */
export const getUserIdFromToken = (token: string): string => {
  const decoded = verifyToken(token);
  return decoded.id;
}; 