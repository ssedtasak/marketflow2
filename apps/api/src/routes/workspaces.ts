import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import type { AppType } from '../types';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { workspaces as workspacesTable, workspaceMembers, users } from '../db/schema';
import { eq } from 'drizzle-orm';

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
  const id = c.req.param('id');
  
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
