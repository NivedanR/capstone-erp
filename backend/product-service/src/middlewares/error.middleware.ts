import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';

interface CustomError extends Error {
  status?: number;
  code?: number;
  keyPattern?: Record<string, any>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const validationError = err as mongoose.Error.ValidationError;
    res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(validationError.errors).map(e => e.message)
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    res.status(400).json({
      message: 'Duplicate Error',
      field: Object.keys(err.keyPattern || {})[0]
    });
    return;
  }

  // Handle other errors
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
};
