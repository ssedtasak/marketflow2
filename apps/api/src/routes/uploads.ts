import { Hono } from 'hono';
import type { Env } from '../index';
import { requireAuth } from '../middleware/auth';

export const uploads = new Hono<{ Bindings: Env }>();
uploads.use('*', requireAuth);

// Issue a presigned URL so the browser can upload directly to R2
uploads.post('/presign', async (c) => {
  return c.json({ todo: 'presign R2 upload URL' });
});
