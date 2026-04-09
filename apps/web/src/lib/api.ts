export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new ApiError(
      errorBody?.error ?? `Request failed with status ${res.status}`,
      res.status,
      errorBody
    );
  }

  // Handle empty responses
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  sendMagicLink: (email: string) =>
    apiRequest<{ ok: boolean }>('/auth/magic-link', {
      method: 'POST',
      body: { email },
    }),

  verifyToken: (token: string) =>
    apiRequest<{ token: string; user: { id: string; email: string } }>(
      `/auth/verify?token=${encodeURIComponent(token)}`
    ),
};

// ─── Workspaces ──────────────────────────────────────────────────────────────

export const workspacesApi = {
  list: (token: string) =>
    apiRequest<{ workspaces: { id: string; name: string; ownerId: string }[] }>(
      '/workspaces',
      { token }
    ).then((res) => (Array.isArray(res) ? res : (res as { workspaces: { id: string; name: string; ownerId: string }[] }).workspaces)),

  create: (token: string, name: string) =>
    apiRequest<{ id: string; name: string; ownerId: string }>(
      '/workspaces',
      { method: 'POST', body: { name }, token }
    ),

  get: (token: string, id: string) =>
    apiRequest<{ id: string; name: string; ownerId: string }>(
      `/workspaces/${id}`,
      { token }
    ),

  getMembers: (token: string, workspaceId: string) =>
    apiRequest<{ members: { userId: string; role: string; name: string; email: string }[] }>(
      `/workspaces/${workspaceId}/members`,
      { token }
    ).then((res) => (Array.isArray(res) ? res : res)),
};

// ─── Lists ────────────────────────────────────────────────────────────────────

export const listsApi = {
  list: (token: string, workspaceId: string) =>
    apiRequest<{ lists: { id: string; workspaceId: string; name: string; position: string; defaultView: string }[] }>(
      `/lists?workspaceId=${encodeURIComponent(workspaceId)}`,
      { token }
    ).then((res) => (Array.isArray(res) ? res : (res as { lists: { id: string; workspaceId: string; name: string; position: string; defaultView: string }[] }).lists)),

  get: (token: string, id: string) =>
    apiRequest<{ id: string; workspaceId: string; name: string; position: string; defaultView: string }>(
      `/lists/${id}`,
      { token }
    ),

  create: (
    token: string,
    data: { workspaceId: string; name: string }
  ) =>
    apiRequest<{ id: string; workspaceId: string; name: string; position: string; defaultView: string }>(
      '/lists',
      { method: 'POST', body: data, token }
    ),

  update: (
    token: string,
    id: string,
    data: { name?: string; position?: string }
  ) =>
    apiRequest<{ id: string }>(
      `/lists/${id}`,
      { method: 'PATCH', body: data, token }
    ),

  delete: (token: string, id: string) =>
    apiRequest<{ ok: boolean }>(`/lists/${id}`, { method: 'DELETE', token }),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (token: string, listId: string) => {
    type TaskResponse = {
      id: string;
      listId: string;
      title: string;
      status: string;
      priority: string | null;
      assigneeId: string | null;
      dueDate: string | null;
      position: string;
      needsApproval: boolean;
      approvedBy: string | null;
      approvedAt: string | null;
      createdAt: string;
    };
    return apiRequest<{ tasks: TaskResponse[] }>(`/tasks?listId=${encodeURIComponent(listId)}`, { token })
      .then((res) => (Array.isArray(res) ? res : (res as { tasks: TaskResponse[] }).tasks));
  },

  get: (token: string, id: string) =>
    apiRequest<{
      id: string;
      listId: string;
      title: string;
      status: string;
      priority: string | null;
      assigneeId: string | null;
      dueDate: string | null;
      position: string;
      needsApproval: boolean;
      approvedBy: string | null;
      approvedAt: string | null;
      createdAt: string;
    }>(`/tasks/${id}`, { token }),

  create: (
    token: string,
    data: {
      listId: string;
      title: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      needsApproval?: boolean;
    }
  ) =>
    apiRequest<{ id: string }>('/tasks', { method: 'POST', body: data, token }),

  update: (
    token: string,
    id: string,
    data: {
      title?: string;
      status?: string;
      priority?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      needsApproval?: boolean;
      approvedBy?: string | null;
      approvedAt?: string | null;
    }
  ) =>
    apiRequest<{ id: string }>(`/tasks/${id}`, { method: 'PATCH', body: data, token }),

  delete: (token: string, id: string) =>
    apiRequest<{ ok: boolean }>(`/tasks/${id}`, { method: 'DELETE', token }),
};
