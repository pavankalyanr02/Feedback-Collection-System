import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
}

export function sendError(
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors?: any[]
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}
