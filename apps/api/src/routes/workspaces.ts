import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import type { AppType } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { workspaces as workspacesTable, workspaceMembers, users, lists, tasks } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

export const workspaces = new Hono<AppType>();

workspaces.use('*', requireAuth);

workspaces.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  
  // Get workspaces where user is a member
  const results = await db
    .select()
    .from(workspacesTable)
    .innerJoin(workspaceMembers, eq(workspacesTable.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, user.id))
    .all();
  
  return c.json({ workspaces: results.map(r => r.workspaces) });
});

workspaces.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const body = await c.req.json();
  
  const id = crypto.randomUUID();
  const now = new Date();
  
  await db.insert(workspacesTable).values({
    id,
    name: body.name,
    ownerId: user.id,
    createdAt: now,
  }).execute();
  
  // Add owner as admin member
  await db.insert(workspaceMembers).values({
    workspaceId: id,
    userId: user.id,
    role: 'admin',
  }).execute();
  
  return c.json({ id, name: body.name, ownerId: user.id, createdAt: now.toISOString() }, 201);
});

workspaces.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const id = c.req.param('id');
  
  // Check if user is a member
  const membership = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, id))
    .get();

  if (!membership) {
    return c.json({ error: 'Forbidden: not a workspace member' }, 403);
  }
  
  const result = await db
    .select()
    .from(workspacesTable)
    .where(eq(workspacesTable.id, id))
    .get();
  
  if (!result) {
    return c.json({ error: 'Workspace not found' }, 404);
  }
  
  return c.json(result);
});

workspaces.get('/:id/members', async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const id = c.req.param('id');

  // Check if user is a member of the workspace
  const membership = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, id))
    .get();

  if (!membership) {
    return c.json({ error: 'Forbidden: not a workspace member' }, 403);
  }

  // Get workspace members with user details
  const results = await db
    .select({
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      name: users.name,
      email: users.email,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, id))
    .all();

  return c.json({ members: results });
});

workspaces.delete('/:id', requireRole('admin')(), async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get('user');
  const id = c.req.param('id');

  // Verify workspace exists and user is owner
  const ws = await db
    .select()
    .from(workspacesTable)
    .where(eq(workspacesTable.id, id))
    .get();

  if (!ws) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  if (ws.ownerId !== user.id) {
    return c.json({ error: 'Only the workspace owner can delete it' }, 403);
  }

  // Get all list IDs in this workspace first (needed for cascade delete)
  const listIdsResult = await db
    .select({ id: lists.id })
    .from(lists)
    .where(eq(lists.workspaceId, id))
    .all();
  const listIds = listIdsResult.map(r => r.id);

  // Delete all tasks for all lists in this workspace
  if (listIds.length > 0) {
    await db.delete(tasks).where(inArray(tasks.listId, listIds)).execute();
  }

  // Delete all lists in workspace
  await db.delete(lists).where(eq(lists.workspaceId, id)).execute();

  // Delete workspace members
  await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, id)).execute();

  // Delete the workspace
  await db.delete(workspacesTable).where(eq(workspacesTable.id, id)).execute();

  return c.json({ ok: true });
});
