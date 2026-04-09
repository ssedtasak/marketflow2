import type { Env } from './index';

type User = { id: string; email: string };

type Variables = {
  user: User;
  workspaceId?: string;
  role?: 'admin' | 'member' | 'viewer';
};

export type AppType = {
  Bindings: Env;
  Variables: Variables;
};
