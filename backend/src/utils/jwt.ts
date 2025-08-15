import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../entities/User';
import { config } from '../config/config';
import logger from './logger';

// Get JWT configuration from centralized config
const JWT_SECRET: Secret = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;

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
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
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
