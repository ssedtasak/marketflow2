import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(1),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(80),
});

export const createTaskSchema = z.object({
  listId: z.string().min(1),
  title: z.string().min(1).max(200),
  position: z.string().min(1).optional(),
  status: z.enum(['todo', 'in_review', 'approved', 'done']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  needsApproval: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  position: z.string().min(1).optional(),
  status: z.enum(['todo', 'in_review', 'approved', 'done']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  needsApproval: z.boolean().optional(),
});

export const createListSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(80),
  position: z.string().min(1).optional(),
  defaultView: z.enum(['list', 'board', 'calendar']).optional(),
});

export const updateListSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  position: z.string().min(1).optional(),
  defaultView: z.enum(['list', 'board', 'calendar']).optional(),
});
