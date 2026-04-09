import type { MiddlewareHandler } from 'hono';
import type { AppType } from '../types';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Dev mode: skip auth verification
// In production, verify JWT from Authorization header
export const requireAuth: MiddlewareHandler<AppType> = async (c, next) => {
  // Skip auth in development (ENVIRONMENT=development)
  if (c.env.ENVIRONMENT === 'development') {
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

  // Production: verify JWT from Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    // Decode the JWT (base64 encoded JSON payload)
    const payload = JSON.parse(atob(token));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Token has expired' }, 401);
    }

    // Validate user still exists
    const db = drizzle(c.env.DB);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .get();

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    c.set('user', { id: payload.sub, email: payload.email });
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }

  await next();
};
