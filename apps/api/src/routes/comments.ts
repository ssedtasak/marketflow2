import { Hono } from 'hono';
import type { Env } from '../index';
import { requireAuth } from '../middleware/auth';

export const comments = new Hono<{ Bindings: Env }>();
comments.use('*', requireAuth);

comments.get('/', async (c) => c.json({ todo: 'list comments' }));
comments.post('/', async (c) => c.json({ todo: 'create comment' }));
comments.patch('/:id', async (c) => c.json({ todo: 'update comment' }));
comments.delete('/:id', async (c) => c.json({ todo: 'delete comment' }));
