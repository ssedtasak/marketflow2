import type { MiddlewareHandler } from 'hono';
import type { AppType } from '../types';
import { drizzle } from 'drizzle-orm/d1';
import { workspaceMembers } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export type Role = 'admin' | 'member' | 'viewer';

/**
 * Middleware factory that checks if the authenticated user has one of the
 * allowed roles in the workspace specified by the route parameter.
 * 
 * Usage:
 *   workspaces.use('*', requireAuth);
 *   workspaces.patch('/:id', requireRole('admin', 'member'), updateHandler);
 * 
 * The workspaceId is extracted from c.req.param('workspaceId') by default.
 * Override by passing a custom paramName.
 */
export const requireRole =
  (...allowed: Role[]) =>
  (paramName = 'id'): MiddlewareHandler<AppType> =>
  async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workspaceId = c.req.param(paramName);
    if (!workspaceId) {
      return c.json({ error: 'Workspace ID is required' }, 400);
    }

    const db = drizzle(c.env.DB);

    // Look up the user's membership in this workspace
    const membership = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, user.id)
        )
      )
      .get();

    if (!membership) {
      return c.json({ error: 'Forbidden: not a workspace member' }, 403);
    }

    // Check if the user's role is in the allowed roles
    if (!allowed.includes(membership.role as Role)) {
      return c.json(
        { error: `Forbidden: requires one of roles: ${allowed.join(', ')}` },
        403
      );
    }

    // Store workspaceId and role in context for downstream handlers
    c.set('workspaceId', workspaceId);
    c.set('role', membership.role as Role);

    await next();
  };
