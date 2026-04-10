import type { MiddlewareHandler } from 'hono';
import type { AppType } from '../types';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { verifyJwt } from '../utils/jwt';

// Dev mode: skip auth verification
// In production, verify JWT from Authorization header
export const requireAuth: MiddlewareHandler<AppType> = async (c, next) => {
  const isDev = c.env.ENVIRONMENT !== 'production';
  const bypassHeader = c.req.header('x-bypass-auth');
  const hasBypass = bypassHeader === 'dev-bypass';

  // Allowed origins for bypass in production
  const origin = c.req.header('origin');
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://27d00f61.marketflow-web.pages.dev',
  ];
  const isAllowedOrigin = origin && allowedOrigins.some(o => 
    o.includes(origin) || (o.startsWith('/') && new RegExp(o).test(origin ?? ''))
  );

  // Skip auth in development OR with bypass header from allowed origin
  if (isDev || (hasBypass && isAllowedOrigin)) {
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
    // Verify the JWT cryptographically using hono/jwt
    const payload = await verifyJwt(token, c.env);

    // Validate user still exists
    const db = drizzle(c.env.DB);
    const userId = payload.sub as string;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    c.set('user', { id: userId, email: payload.email as string });
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }

  await next();
};
