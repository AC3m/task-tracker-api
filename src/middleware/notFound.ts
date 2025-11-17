import { Request, Response, NextFunction } from 'express';
import { CustomError } from './error.js';

const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  const error: CustomError = new Error('Not Found');
  error.status = 404;
  next(error);
};

export default notFound;
