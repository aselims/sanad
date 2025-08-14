import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetTime: Date;
}

// In-memory storage for rate limiting
// In production, consider using Redis for better scalability
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every hour
setInterval(() => {
  const now = new Date();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(ip);
    }
  }
  logger.info(`Rate limit cleanup completed. Active entries: ${rateLimitStore.size}`);
}, 60 * 60 * 1000); // 1 hour

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

/**
 * Create a rate limiting middleware
 */
export function createRateLimit(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP address
    const clientIP = req.ip || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                    'unknown';

    const now = new Date();
    const key = `${clientIP}:${req.route?.path || req.path}`;
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: new Date(now.getTime() + options.windowMs)
      };
      rateLimitStore.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= options.max) {
      const timeUntilReset = Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000);
      
      logger.warn(`Rate limit exceeded for IP ${clientIP} on ${req.path}. Reset in ${timeUntilReset}s`);
      
      res.status(429).json({
        status: 'error',
        message: options.message || 'Too many requests. Please try again later.',
        retryAfter: timeUntilReset,
        limit: options.max,
        remaining: 0,
        resetTime: entry.resetTime.toISOString()
      });
      return;
    }

    // Increment counter
    entry.count++;
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': (options.max - entry.count).toString(),
      'X-RateLimit-Reset': entry.resetTime.toISOString()
    });

    logger.debug(`Rate limit check for IP ${clientIP}: ${entry.count}/${options.max}`);
    
    next();
  };
}

/**
 * Predefined rate limiter for AI search: 3 requests per day
 */
export const aiSearchRateLimit = createRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 requests per day
  message: 'Daily AI search limit reached (3 requests per day). Please register for unlimited access or try again tomorrow.'
});

/**
 * General API rate limiter: 100 requests per 15 minutes
 */
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP. Please try again later.'
});