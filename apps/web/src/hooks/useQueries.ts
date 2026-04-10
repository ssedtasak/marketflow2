import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi, listsApi, tasksApi } from '@/lib/api';
import type { UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  workspaces: ['workspaces'] as const,
  workspaceMembers: (workspaceId: string) => ['workspaceMembers', workspaceId] as const,
  lists: (workspaceId: string) => ['lists', workspaceId] as const,
  tasks: (listId: string) => ['tasks', listId] as const,
  task: (id: string) => ['task', id] as const,
};

// ─── Workspaces ───────────────────────────────────────────────────────────────

export function useWorkspaces() {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: () => {
      if (!token) throw new Error('Not authenticated');
      return workspacesApi.list(token);
    },
    enabled: !!token,
  });
}

export function useCreateWorkspace() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => {
      if (!token) throw new Error('Not authenticated');
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
    mutationFn: (id: string) => {
      if (!token) throw new Error('Not authenticated');
      return workspacesApi.delete(token, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.workspaceMembers(workspaceId),
    queryFn: () => {
      if (!token) throw new Error('Not authenticated');
      return workspacesApi.getMembers(token, workspaceId);
    },
    enabled: !!token && !!workspaceId,
  });
}

// ─── Lists ────────────────────────────────────────────────────────────────────

export function useLists(workspaceId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.lists(workspaceId),
    queryFn: () => {
      if (!token) throw new Error('Not authenticated');
      return listsApi.list(token, workspaceId);
    },
    enabled: !!token && !!workspaceId,
  });
}

export function useList(listId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['list', listId] as const,
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      return listsApi.get(token, listId);
    },
    enabled: !!token && !!listId,
  });
}

export function useCreateList() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { workspaceId: string; name: string }) => {
      if (!token) throw new Error('Not authenticated');
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      workspaceId: string;
      data: { name?: string };
    }) => {
      if (!token) throw new Error('Not authenticated');
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
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) => {
      if (!token) throw new Error('Not authenticated');
      return listsApi.delete(token, id);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.lists(vars.workspaceId) });
    },
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  listId: string;
  title: string;
  status: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | null;
  assigneeId: string | null;
  dueDate: string | null;
  position: string;
  needsApproval: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export function useTasks(listId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks(listId),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const data = await tasksApi.list(token, listId);
      return data.map((t) => ({
        ...t,
        status: t.status as Task['status'],
        priority: t.priority as Task['priority'],
      }));
    },
    enabled: !!token && !!listId,
  });
}

export function useTask(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: queryKeys.task(id),
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated');
      const data = await tasksApi.get(token, id);
      return {
        ...data,
        status: data.status as Task['status'],
        priority: data.priority as Task['priority'],
      };
    },
    enabled: !!token && !!id,
  });
}

export function useCreateTask() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      listId: string;
      title: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      needsApproval?: boolean;
    }) => {
      if (!token) throw new Error('Not authenticated');
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
    mutationFn: ({
      id,
      listId,
      data,
    }: {
      id: string;
      listId: string;
      data: {
        title?: string;
        status?: string;
        priority?: string;
        assigneeId?: string | null;
        dueDate?: string | null;
        needsApproval?: boolean;
        approvedBy?: string | null;
        approvedAt?: string | null;
      };
    }) => {
      if (!token) throw new Error('Not authenticated');
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
    mutationFn: ({ id, listId }: { id: string; listId: string }) => {
      if (!token) throw new Error('Not authenticated');
      return tasksApi.delete(token, id);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks(vars.listId) });
    },
  });
}
