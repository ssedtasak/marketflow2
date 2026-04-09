import { Hono } from 'hono';
import type { Env } from '../index';

export const auth = new Hono<{ Bindings: Env }>();

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
