// Marketing workflow: create → review → approve → ship
export const TASK_STATUSES = ['todo', 'in_review', 'approved', 'done'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export const DEFAULT_VIEW = 'calendar' as const; // deadline-first: calendar is primary view

export const MAGIC_TOKEN_TTL_SECONDS = 60 * 15;        // 15 minutes
export const JWT_TTL_SECONDS = 60 * 60 * 24 * 7;       // 7 days
