import type { Env } from './index';

type User = { id: string; email: string };

type Variables = {
  user: User;
};

export type AppType = {
  Bindings: Env;
  Variables: Variables;
};
