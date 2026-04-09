import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import type { AppType } from '../types';
import { requireAuth } from '../middleware/auth';
import { tasks as tasksTable } from '../db/schema';
import { createTaskSchema, updateTaskSchema } from '@marketflow/shared/schemas';

export const tasks = new Hono<AppType>();

tasks.use('*', requireAuth);

// GET /tasks?listId=X — list all tasks in a list
tasks.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const listId = c.req.query('listId');

  if (!listId) {
    return c.json({ error: 'listId query parameter is required' }, 400);
  }

  const results = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.listId, listId))
    .all();

  return c.json({ tasks: results });
});

// POST /tasks — create a new task
tasks.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const body = await c.req.json();

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date();

  const insertValues = {
    id,
    listId: data.listId,
    title: data.title,
    position: data.position,
    status: data.status ?? 'todo',
    priority: data.priority ?? null,
    assigneeId: data.assigneeId ?? null,
    dueDate: data.dueDate ?? null,
    needsApproval: data.needsApproval ?? false,
    createdAt: now,
  };

  await db.insert(tasksTable).values(insertValues).execute();

  return c.json({ ...insertValues, approvedBy: null, approvedAt: null, ydocState: null }, 201);
});

// GET /tasks/:id — get single task
tasks.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  const result = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .get();

  if (!result) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.json(result);
});

// PATCH /tasks/:id — update task
tasks.patch('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();

  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;

  // If nothing to update, just return the existing task
  if (Object.keys(data).length === 0) {
    const existing = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id))
      .get();

    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }
    return c.json(existing);
  }

  // Build update values
  const updateValues: Record<string, unknown> = {};

  if (data.title !== undefined) updateValues.title = data.title;
  if (data.position !== undefined) updateValues.position = data.position;
  if (data.priority !== undefined) updateValues.priority = data.priority;
  if (data.assigneeId !== undefined) updateValues.assigneeId = data.assigneeId;
  if (data.dueDate !== undefined) updateValues.dueDate = data.dueDate;
  if (data.needsApproval !== undefined) updateValues.needsApproval = data.needsApproval;

  // Handle status change — auto-approve when status becomes 'approved'
  if (data.status !== undefined) {
    updateValues.status = data.status;
    if (data.status === 'approved') {
      updateValues.approvedBy = user.id;
      updateValues.approvedAt = new Date();
    }
  }

  // Verify task exists before updating
  const existing = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .get();

  if (!existing) {
    return c.json({ error: 'Task not found' }, 404);
  }

  await db
    .update(tasksTable)
    .set(updateValues)
    .where(eq(tasksTable.id, id))
    .execute();

  // Fetch and return the updated task
  const updated = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .get();

  return c.json(updated);
});

// DELETE /tasks/:id — delete a task
tasks.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  // Verify task exists
  const existing = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .get();

  if (!existing) {
    return c.json({ error: 'Task not found' }, 404);
  }

  await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, id))
    .execute();

  return c.json({ success: true });
});
