import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserRole } from '../entities/User';
import { AppError } from './errorHandler';

/**
 * Middleware to authenticate JWT token
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for certain paths if needed
  const skipAuthPaths = ['/api/health', '/api/version'];
  if (skipAuthPaths.includes(req.path)) {
    return next();
  }

  // Add timeout to prevent hanging
  const authTimeout = setTimeout(() => {
    return next(new AppError('Authentication timeout', 500));
  }, 5000); // 5 second timeout

  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    clearTimeout(authTimeout); // Clear the timeout

    if (err) {
      return next(new AppError(`Authentication error: ${err.message}`, 500));
    }

    if (!user) {
      return next(new AppError('Unauthorized - Invalid token', 401));
    }

    req.user = user;
    return next();
  })(req, res, next);
};

/**
 * Middleware to check if user has required role
 * @param roles Array of allowed roles
 */
export const authorizeRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized - User not authenticated', 401));
    }

    const userRole = (req.user as any).role;
    if (!roles.includes(userRole)) {
      return next(new AppError('Forbidden - Insufficient permissions', 403));
    }

    return next();
  };
};

/**
 * Middleware to check if user is accessing their own resource
 * @param paramIdField Name of the parameter containing the resource ID
 */
export const authorizeOwner = (paramIdField: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized - User not authenticated', 401));
    }

    const resourceId = req.params[paramIdField];
    const userId = (req.user as any).id;

    // Admin can access any resource
    if ((req.user as any).role === UserRole.ADMIN) {
      return next();
    }

    // Check if user is the owner of the resource
    if (resourceId && resourceId !== userId) {
      return next(new AppError('Forbidden - You can only access your own resources', 403));
    }

    return next();
  };
};

/**
 * Optional authentication middleware - sets user if token is valid, but doesn't require authentication
 * This is useful for endpoints that provide different functionality based on authentication status
 */
export const optionalAuthentication = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If no auth header is present, continue without setting user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Add timeout to prevent hanging
  const authTimeout = setTimeout(() => {
    return next(); // Continue without authentication if timeout
  }, 5000); // 5 second timeout

  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    clearTimeout(authTimeout); // Clear the timeout

    if (err) {
      // Log the error but continue without authentication
      console.warn(`Optional authentication error: ${err.message}`);
      return next();
    }

    if (user) {
      // Set user if authentication successful
      req.user = user;
    }

    // Always continue, whether authentication succeeded or not
    return next();
  })(req, res, next);
};
