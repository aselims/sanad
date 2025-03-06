import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error
  if (isOperational) {
    logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  } else {
    logger.error(`${err.stack}`);
  }

  // Development vs Production error responses
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack,
      error: err,
    });
  }

  // Production error response
  return res.status(statusCode).json({
    status: 'error',
    message: isOperational ? message : 'Something went wrong',
  });
}; 