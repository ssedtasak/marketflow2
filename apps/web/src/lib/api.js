export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';
const IS_PROD = import.meta.env.VITE_ENVIRONMENT === 'production';
export class ApiError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = 'ApiError';
    }
}
async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body, token } = options;
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Add bypass header in development
    if (!IS_PROD) {
        headers['x-bypass-auth'] = 'dev-bypass';
    }
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new ApiError(errorBody?.error ?? `Request failed with status ${res.status}`, res.status, errorBody);
    }
    // Handle empty responses
    const text = await res.text();
    if (!text)
        return {};
    return JSON.parse(text);
}
// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
    sendMagicLink: (email) => apiRequest('/auth/magic-link', {
        method: 'POST',
        body: { email },
    }),
    verifyToken: (token) => apiRequest(`/auth/verify?token=${encodeURIComponent(token)}`),
};
// ─── Workspaces ──────────────────────────────────────────────────────────────
export const workspacesApi = {
    list: (token) => apiRequest('/workspaces', { token }).then((res) => (Array.isArray(res) ? res : res.workspaces)),
    create: (token, name) => apiRequest('/workspaces', { method: 'POST', body: { name }, token }),
    get: (token, id) => apiRequest(`/workspaces/${id}`, { token }),
    getMembers: (token, workspaceId) => apiRequest(`/workspaces/${workspaceId}/members`, { token }).then((res) => (Array.isArray(res) ? res : res)),
};
// ─── Lists ────────────────────────────────────────────────────────────────────
export const listsApi = {
    list: (token, workspaceId) => apiRequest(`/lists?workspaceId=${encodeURIComponent(workspaceId)}`, { token }).then((res) => (Array.isArray(res) ? res : res.lists)),
    get: (token, id) => apiRequest(`/lists/${id}`, { token }),
    create: (token, data) => apiRequest('/lists', { method: 'POST', body: data, token }),
    update: (token, id, data) => apiRequest(`/lists/${id}`, { method: 'PATCH', body: data, token }),
    delete: (token, id) => apiRequest(`/lists/${id}`, { method: 'DELETE', token }),
};
// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasksApi = {
    list: (token, listId) => {
        return apiRequest(`/tasks?listId=${encodeURIComponent(listId)}`, { token })
            .then((res) => (Array.isArray(res) ? res : res.tasks));
    },
    get: (token, id) => apiRequest(`/tasks/${id}`, { token }),
    create: (token, data) => apiRequest('/tasks', { method: 'POST', body: data, token }),
    update: (token, id, data) => apiRequest(`/tasks/${id}`, { method: 'PATCH', body: data, token }),
    delete: (token, id) => apiRequest(`/tasks/${id}`, { method: 'DELETE', token }),
};
