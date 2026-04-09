import type { ErrorHandler } from 'hono';
import type { Env } from '../index';

export const errorHandler: ErrorHandler<{ Bindings: Env }> = (err, c) => {
  console.error(err);
  return c.json({ error: err.message ?? 'Internal error' }, 500);
};
