import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { Resend } from 'resend';
import type { Env } from '../index';
import { magicTokens, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const auth = new Hono<{ Bindings: Env }>();

// Dev mode: always use dev user
const DEV_USER = { id: 'dev-user-1', email: 'dev@example.com' };
const DEV_TOKEN = 'dev-token';

auth.post('/register', async (c) => {
  // TODO: implement email/password registration
  return c.json({ todo: 'register' });
});

auth.post('/login', async (c) => {
  // TODO: verify credentials, issue JWT
  return c.json({ todo: 'login' });
});

auth.post('/logout', async (c) => {
  return c.json({ todo: 'logout' });
});

// POST /auth/magic-link — send magic link to email
auth.post('/magic-link', async (c) => {
  const db = drizzle(c.env.DB);
  const { email } = await c.req.json<{ email: string }>();

  if (!email || typeof email !== 'string') {
    return c.json({ error: 'Email is required' }, 400);
  }

  const isDev = c.env.ENVIRONMENT === 'development';

  if (isDev) {
    // Dev mode: skip email, return fake token
    console.log(`[DEV] Magic link requested for ${email}, auto-approving`);
    return c.json({ ok: true, token: DEV_TOKEN });
  }

  // Production: generate token and send email via Resend
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store token in database
  await db.insert(magicTokens).values({
    id: token,
    email,
    expiresAt,
    used: false,
  }).execute();

  // Send email via Resend
  try {
    const resend = new Resend(c.env.RESEND_API_KEY);
    const verifyUrl = `https://marketflow.app/auth/verify?token=${token}`;
    
    await resend.emails.send({
      from: 'MarketFlow <noreply@marketflow.app>',
      to: email,
      subject: 'Your MarketFlow login link',
      html: `
        <p>Click the link below to sign in to MarketFlow:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires in 15 minutes.</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send email via Resend:', err);
    return c.json({ error: 'Failed to send email. Please try again.' }, 500);
  }

  return c.json({ ok: true, message: 'Check your email for a login link' });
});

// GET /auth/verify?token=xxx — verify magic link token
auth.get('/verify', async (c) => {
  const db = drizzle(c.env.DB);
  const token = c.req.query('token');

  if (!token) {
    return c.json({ error: 'Token is required' }, 400);
  }

  const isDev = c.env.ENVIRONMENT === 'development';

  if (isDev) {
    // Dev mode: accept any token, return dev user
    if (token === DEV_TOKEN) {
      return c.json({ token: DEV_TOKEN, user: DEV_USER });
    }
    // Allow any token in dev mode for testing different emails
    const devUser = { id: `dev-user-${Date.now()}`, email: 'test@example.com' };
    return c.json({ token: DEV_TOKEN, user: devUser });
  }

  // Production: verify magic link token from database
  const tokenRecord = await db
    .select()
    .from(magicTokens)
    .where(
      and(
        eq(magicTokens.id, token),
        eq(magicTokens.used, false),
      )
    )
    .get();

  if (!tokenRecord) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Check if token is expired
  if (new Date(tokenRecord.expiresAt) < new Date()) {
    return c.json({ error: 'Token has expired' }, 401);
  }

  // Mark token as used
  await db
    .update(magicTokens)
    .set({ used: true })
    .where(eq(magicTokens.id, token))
    .execute();

  // Find or create user
  let user = await db
    .select()
    .from(users)
    .where(eq(users.email, tokenRecord.email))
    .get();

  if (!user) {
    // Create new user with random ID
    const userId: string = crypto.randomUUID();
    const now: Date = new Date();
    
    // email is notNull in schema but drizzle may infer as optional
    const rawEmail = tokenRecord.email;
    if (!rawEmail) return c.json({ error: 'Invalid token data' }, 400);
    
    // Create explicit string values
    const userEmail = String(rawEmail);
    const parts = userEmail.split('@');
    const userName = parts[0] ?? userEmail;
    
    // Use explicit type to avoid inference issues
    type UserInsert = { id: string; email: string; name: string; createdAt: Date };
    const insertValues: UserInsert = {
      id: userId,
      email: userEmail,
      name: userName,
      createdAt: now,
    };
    
    await db.insert(users).values(insertValues).execute();

    user = { id: userId, email: userEmail, name: userName, createdAt: now };
  }

  // Generate a simple JWT-like token (in production, use a proper JWT library)
  const currentUser = user!;
  const jwtPayload = {
    sub: currentUser.id,
    email: currentUser.email,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };
  const encodedToken = btoa(JSON.stringify(jwtPayload));

  return c.json({ token: encodedToken, user: { id: currentUser.id, email: currentUser.email } });
});
