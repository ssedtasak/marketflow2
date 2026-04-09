import { Hono } from 'hono';
import type { Env } from '../index';

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

  // Production: send real email via Resend
  // TODO: Implement Resend integration
  // const resend = new Resend(c.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'MarketFlow <noreply@marketflow.app>',
  //   to: email,
  //   subject: 'Your MarketFlow login link',
  //   html: `<p>Click <a href="https://marketflow.app/auth/verify?token=${token}">here</a> to login.</p>`,
  // });
  console.log(`[PROD] Would send magic link to ${email}`);
  return c.json({ ok: true, message: 'Check your email for a login link' });
});

// GET /auth/verify?token=xxx — verify magic link token
auth.get('/verify', async (c) => {
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
  // TODO: Look up token in magic_tokens table, return associated user
  console.log(`[PROD] Would verify token: ${token}`);
  return c.json({ error: 'Invalid or expired token' }, 401);
});
