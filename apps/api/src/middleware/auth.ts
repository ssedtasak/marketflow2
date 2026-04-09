import type { MiddlewareHandler } from 'hono';
import type { AppType } from '../types';

// Dev mode: skip auth verification
// In production, implement proper JWT verification
export const requireAuth: MiddlewareHandler<AppType> = async (c, next) => {
  // Skip auth in development (ENVIRONMENT=development)
  if (c.env.ENVIRONMENT === 'development') {
    const { drizzle } = await import('drizzle-orm/d1');
    const { users } = await import('../db/schema');
    const db = drizzle(c.env.DB);

    // Ensure dev user exists (upsert)
    await db.insert(users).values({
      id: 'dev-user-1',
      email: 'dev@example.com',
      name: 'Dev User',
      createdAt: new Date(),
    }).onConflictDoUpdate({
      target: users.id,
      set: { email: 'dev@example.com', name: 'Dev User' },
    }).execute();

    c.set('user', { id: 'dev-user-1', email: 'dev@example.com' });
    await next();
    return;
  }

  // TODO: verify JWT from Authorization header, attach user to context
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
};
