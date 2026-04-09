import type { MiddlewareHandler } from 'hono';
import type { Env } from '../index';

// Placeholder — prefer Cloudflare WAF rate-limiting rules in production.
export const rateLimit: MiddlewareHandler<{ Bindings: Env }> = async (_c, next) => {
  await next();
};
