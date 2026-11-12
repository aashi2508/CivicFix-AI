import { RequestHandler, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export const notFound: RequestHandler = (_req, res) => res.status(404).json({ error: 'Not found' });
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.flatten(),
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload failed: ${error.message}` });
  }

  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    return res.status(409).json({ error: 'Database request could not be completed' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};
