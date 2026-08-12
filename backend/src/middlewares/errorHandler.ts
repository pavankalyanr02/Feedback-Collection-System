import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, path: req.path }, 'Non-operational AppError occurred');
    }
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  logger.error({ err, path: req.path }, 'Unhandled exception');

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return sendError(res, message, 500);
}
