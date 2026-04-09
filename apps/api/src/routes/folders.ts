import { Hono } from 'hono';
import type { Env } from '../index';
import { requireAuth } from '../middleware/auth';

export const folders = new Hono<{ Bindings: Env }>();
folders.use('*', requireAuth);

folders.get('/', async (c) => c.json({ todo: 'list folders' }));
folders.post('/', async (c) => c.json({ todo: 'create folder' }));
folders.patch('/:id', async (c) => c.json({ todo: 'update folder' }));
folders.delete('/:id', async (c) => c.json({ todo: 'delete folder' }));
