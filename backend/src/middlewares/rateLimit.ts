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

export interface SmartRateLimitOptions extends RateLimitOptions {
  authenticatedMax?: number; // Different limit for authenticated users
  authenticationAware?: boolean; // Enable user-based rate limiting
  fallbackToIP?: boolean; // Use IP limiting when user auth fails
  authenticatedMessage?: string; // Custom message for authenticated users
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
 * Smart rate limiter for AI search with authentication awareness
 * Anonymous users: 10 requests per hour
 * Authenticated users: 10 requests per hour per user
 */
export const smartAISearchRateLimit = createSmartRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour for anonymous users (IP-based)
  authenticatedMax: 10, // 10 requests per hour for authenticated users (user-based)
  authenticationAware: true,
  message: 'AI search rate limit exceeded (10 requests per hour). Please try again later.',
  authenticatedMessage: 'AI search rate limit exceeded for your account (10 requests per hour). Please try again later.'
});

/**
 * Legacy rate limiter for AI search (deprecated - use smartAISearchRateLimit instead)
 * @deprecated Use smartAISearchRateLimit for better user experience
 */
export const aiSearchRateLimit = createRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 requests per day
  message: 'Daily AI search limit reached (3 requests per day). Please register for unlimited access or try again tomorrow.'
});

/**
 * Create a smart rate limiting middleware that considers user authentication
 */
export function createSmartRateLimit(options: SmartRateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = new Date();
    const clientIP = req.ip || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                    'unknown';

    // Determine if user is authenticated and get appropriate limits
    const user = (req as any).user;
    const isAuthenticated = user && user.id;
    
    let key: string;
    let currentMax: number;
    let currentMessage: string;
    
    if (options.authenticationAware && isAuthenticated) {
      // Use user-based rate limiting for authenticated users
      key = `user:${user.id}:${req.route?.path || req.path}`;
      currentMax = options.authenticatedMax || options.max;
      currentMessage = options.authenticatedMessage || options.message || 'Rate limit exceeded for authenticated user';
    } else {
      // Use IP-based rate limiting for anonymous users
      key = `ip:${clientIP}:${req.route?.path || req.path}`;
      currentMax = options.max;
      currentMessage = options.message || 'Rate limit exceeded';
    }
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: new Date(now.getTime() + options.windowMs)
      };
      rateLimitStore.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= currentMax) {
      const timeUntilReset = Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000);
      
      const identifier = isAuthenticated ? `user ${user.id}` : `IP ${clientIP}`;
      logger.warn(`Rate limit exceeded for ${identifier} on ${req.path}. Reset in ${timeUntilReset}s`);
      
      // Enhanced response for better user experience
      const response: any = {
        status: 'error',
        message: currentMessage,
        retryAfter: timeUntilReset,
        limit: currentMax,
        remaining: 0,
        resetTime: entry.resetTime.toISOString(),
        rateLimitType: isAuthenticated ? 'user' : 'ip'
      };
      
      // Add upgrade suggestion for anonymous users
      if (!isAuthenticated && options.authenticatedMax && options.authenticatedMax > options.max) {
        response.upgrade = {
          suggestion: 'Sign in to get higher rate limits',
          authenticatedLimit: options.authenticatedMax,
          currentLimit: options.max
        };
      }
      
      res.status(429).json(response);
      return;
    }

    // Increment counter
    entry.count++;
    
    // Add comprehensive rate limit headers
    res.set({
      'X-RateLimit-Limit': currentMax.toString(),
      'X-RateLimit-Remaining': (currentMax - entry.count).toString(),
      'X-RateLimit-Reset': entry.resetTime.toISOString(),
      'X-RateLimit-Type': isAuthenticated ? 'user' : 'ip'
    });

    const identifier = isAuthenticated ? `user ${user.id}` : `IP ${clientIP}`;
    logger.debug(`Rate limit check for ${identifier}: ${entry.count}/${currentMax}`);
    
    next();
  };
}

/**
 * General API rate limiter: 100 requests per 15 minutes
 */
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP. Please try again later.'
});