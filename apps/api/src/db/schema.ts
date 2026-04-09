import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const workspaceMembers = sqliteTable('workspace_members', {
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role', { enum: ['admin', 'member', 'viewer'] }).notNull(),
});

// Phase 2+: spaces and folders (hierarchy depth) — not built in Phase 1

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  position: text('position').notNull(),
  defaultView: text('default_view', { enum: ['list', 'board', 'calendar'] }).notNull().default('calendar'),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  listId: text('list_id').notNull().references(() => lists.id),
  title: text('title').notNull(),
  status: text('status', { enum: ['todo', 'in_review', 'approved', 'done'] }).notNull().default('todo'),
  priority: text('priority', { enum: ['low', 'normal', 'high', 'urgent'] }),
  assigneeId: text('assignee_id').references(() => users.id),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  position: text('position').notNull(),
  needsApproval: integer('needs_approval', { mode: 'boolean' }).notNull().default(false),
  approvedBy: text('approved_by').references(() => users.id),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  ydocState: blob('ydoc_state'),          // Phase 2: Yjs Sync Doc
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const magicTokens = sqliteTable('magic_tokens', {
  id: text('id').primaryKey(),            // crypto.randomUUID() — the token itself
  email: text('email').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
});

// Phase 3+: comments, attachments
