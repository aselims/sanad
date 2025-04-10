import { Request, Response, NextFunction, RequestHandler } from 'express';

export type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any> | any;

/**
 * A utility type wrapper for Express route handlers
 * This solves TypeScript errors with route handlers that return Response objects
 */
export const routeHandler = (handler: ExpressHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}; 