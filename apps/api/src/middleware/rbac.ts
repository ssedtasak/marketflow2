import type { MiddlewareHandler } from 'hono';
import type { Env } from '../index';

export type Role = 'admin' | 'member' | 'viewer';

export const requireRole =
  (...allowed: Role[]): MiddlewareHandler<{ Bindings: Env }> =>
  async (c, next) => {
    // TODO: load membership, check role against `allowed`
    await next();
  };
