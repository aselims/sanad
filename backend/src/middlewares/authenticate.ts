import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AppError } from './errorHandler';

/**
 * Simplified middleware to authenticate JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
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
