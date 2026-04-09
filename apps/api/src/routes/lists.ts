import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import type { Env } from '../index';
import { requireAuth } from '../middleware/auth';
import { lists as listsTable } from '../db/schema';
import { createListSchema, updateListSchema } from '@marketflow/shared/schemas';

export const lists = new Hono<{ Bindings: Env }>();
lists.use('*', requireAuth);

// GET /lists?workspaceId=X — list all lists in a workspace
lists.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const workspaceId = c.req.query('workspaceId');

  if (!workspaceId) {
    return c.json({ error: 'workspaceId query parameter is required' }, 400);
  }

  const results = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.workspaceId, workspaceId))
    .all();

  return c.json({ lists: results });
});

// GET /lists/:id — get a single list
lists.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  const result = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.id, id))
    .get();

  if (!result) {
    return c.json({ error: 'List not found' }, 404);
  }

  return c.json(result);
});

// POST /lists — create a new list
lists.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  const parsed = createListSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { workspaceId, name, position, defaultView } = parsed.data;
  const id = crypto.randomUUID();

  await db.insert(listsTable).values({
    id,
    workspaceId,
    name,
    position,
    defaultView: defaultView ?? 'calendar',
  }).execute();

  return c.json({
    id,
    workspaceId,
    name,
    position,
    defaultView: defaultView ?? 'calendar',
  }, 201);
});

// PATCH /lists/:id — update a list
lists.patch('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');
  const body = await c.req.json();

  const parsed = updateListSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Check list exists
  const existing = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.id, id))
    .get();

  if (!existing) {
    return c.json({ error: 'List not found' }, 404);
  }

  // Build update object from parsed data (only defined fields)
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.position !== undefined) updates.position = parsed.data.position;
  if (parsed.data.defaultView !== undefined) updates.defaultView = parsed.data.defaultView;

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  await db
    .update(listsTable)
    .set(updates)
    .where(eq(listsTable.id, id))
    .execute();

  return c.json({ id, ...updates });
});

// DELETE /lists/:id — delete a list
lists.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  // Check list exists
  const existing = await db
    .select()
    .from(listsTable)
    .where(eq(listsTable.id, id))
    .get();

  if (!existing) {
    return c.json({ error: 'List not found' }, 404);
  }

  await db
    .delete(listsTable)
    .where(eq(listsTable.id, id))
    .execute();

  return c.json({ success: true });
});
