import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi, listsApi, tasksApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
// ─── Query Keys ───────────────────────────────────────────────────────────────
export const queryKeys = {
    workspaces: ['workspaces'],
    workspaceMembers: (workspaceId) => ['workspaceMembers', workspaceId],
    lists: (workspaceId) => ['lists', workspaceId],
    tasks: (listId) => ['tasks', listId],
    task: (id) => ['task', id],
};
// ─── Workspaces ───────────────────────────────────────────────────────────────
export function useWorkspaces() {
    const { token } = useAuth();
    return useQuery({
        queryKey: queryKeys.workspaces,
        queryFn: () => {
            if (!token)
                throw new Error('Not authenticated');
            return workspacesApi.list(token);
        },
        enabled: !!token,
    });
}
export function useCreateWorkspace() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name) => {
            if (!token)
                throw new Error('Not authenticated');
            return workspacesApi.create(token, name);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.workspaces });
        },
    });
}
export function useDeleteWorkspace() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => {
            if (!token)
                throw new Error('Not authenticated');
            return workspacesApi.delete(token, id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.workspaces });
        },
    });
}
export function useWorkspaceMembers(workspaceId) {
    const { token } = useAuth();
    return useQuery({
        queryKey: queryKeys.workspaceMembers(workspaceId),
        queryFn: () => {
            if (!token)
                throw new Error('Not authenticated');
            return workspacesApi.getMembers(token, workspaceId);
        },
        enabled: !!token && !!workspaceId,
    });
}
// ─── Lists ────────────────────────────────────────────────────────────────────
export function useLists(workspaceId) {
    const { token } = useAuth();
    return useQuery({
        queryKey: queryKeys.lists(workspaceId),
        queryFn: () => {
            if (!token)
                throw new Error('Not authenticated');
            return listsApi.list(token, workspaceId);
        },
        enabled: !!token && !!workspaceId,
    });
}
export function useList(listId) {
    const { token } = useAuth();
    return useQuery({
        queryKey: ['list', listId],
        queryFn: async () => {
            if (!token)
                throw new Error('Not authenticated');
            return listsApi.get(token, listId);
        },
        enabled: !!token && !!listId,
    });
}
export function useCreateList() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => {
            if (!token)
                throw new Error('Not authenticated');
            return listsApi.create(token, data);
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.lists(vars.workspaceId) });
        },
    });
}
export function useUpdateList() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data, }) => {
            if (!token)
                throw new Error('Not authenticated');
            return listsApi.update(token, id, data);
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.lists(vars.workspaceId) });
        },
    });
}
export function useDeleteList() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, workspaceId }) => {
            if (!token)
                throw new Error('Not authenticated');
            return listsApi.delete(token, id);
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.lists(vars.workspaceId) });
        },
    });
}
export function useTasks(listId) {
    const { token } = useAuth();
    return useQuery({
        queryKey: queryKeys.tasks(listId),
        queryFn: async () => {
            if (!token)
                throw new Error('Not authenticated');
            const data = await tasksApi.list(token, listId);
            return data.map((t) => ({
                ...t,
                status: t.status,
                priority: t.priority,
            }));
        },
        enabled: !!token && !!listId,
    });
}
export function useTask(id) {
    const { token } = useAuth();
    return useQuery({
        queryKey: queryKeys.task(id),
        queryFn: async () => {
            if (!token)
                throw new Error('Not authenticated');
            const data = await tasksApi.get(token, id);
            return {
                ...data,
                status: data.status,
                priority: data.priority,
            };
        },
        enabled: !!token && !!id,
    });
}
export function useCreateTask() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => {
            if (!token)
                throw new Error('Not authenticated');
            return tasksApi.create(token, data);
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.tasks(vars.listId) });
        },
    });
}
export function useUpdateTask() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, listId, data, }) => {
            if (!token)
                throw new Error('Not authenticated');
            return tasksApi.update(token, id, data);
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.tasks(vars.listId) });
            qc.invalidateQueries({ queryKey: queryKeys.task(vars.id) });
        },
    });
}
export function useDeleteTask() {
    const { token } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, listId }) => {
            if (!token)
                throw new Error('Not authenticated');
            return tasksApi.delete(token, id);
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.tasks(vars.listId) });
        },
    });
}
