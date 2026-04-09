import { useState, useEffect } from 'react';
import { useUpdateTask, useList, useWorkspaceMembers, type Task } from '@/hooks/useQueries';
import { useAuth } from '@/lib/auth-context';

const STATUS_OPTIONS = ['todo', 'in_review', 'approved', 'done'] as const;
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_review: 'In Review',
  approved: 'Approved',
  done: 'Done',
};
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'] as const;

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onUpdated?: (task: Task) => void;
}

export function TaskDetailPanel({ task, onClose, onUpdated }: TaskDetailPanelProps) {
  const { user } = useAuth();
  const updateTask = useUpdateTask();
  
  // Fetch list to get workspaceId
  const { data: list } = useList(task.listId);
  const workspaceId = list?.workspaceId;
  
  // Fetch workspace members for assignee dropdown
  const { data: membersData } = useWorkspaceMembers(workspaceId ?? '');
  const members = membersData?.members ?? [];

  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [priority, setPriority] = useState<string>(task.priority ?? '');
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [needsApproval, setNeedsApproval] = useState(task.needsApproval);
  const [isDirty, setIsDirty] = useState(false);

  // Reset state when task changes
  useEffect(() => {
    setTitle(task.title);
    setStatus(task.status);
    setPriority(task.priority ?? '');
    setAssigneeId(task.assigneeId ?? '');
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setNeedsApproval(task.needsApproval);
  }, [task]);

  useEffect(() => {
    const dirty =
      title !== task.title ||
      status !== task.status ||
      priority !== (task.priority ?? '') ||
      assigneeId !== (task.assigneeId ?? '') ||
      dueDate !== (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '') ||
      needsApproval !== task.needsApproval;
    setIsDirty(dirty);
  }, [title, status, priority, assigneeId, dueDate, needsApproval, task]);

  const handleSave = async () => {
    try {
      const isApproving = status === 'approved' && task.status !== 'approved';
      const updateData: {
        title?: string;
        status?: string;
        priority?: string;
        assigneeId?: string | null;
        dueDate?: string | null;
        needsApproval?: boolean;
        approvedBy?: string | null;
        approvedAt?: string | null;
      } = {
        title: title !== task.title ? title : undefined,
        status: status !== task.status ? status : undefined,
        priority: priority !== '' ? (priority as string) : undefined,
        assigneeId: assigneeId !== '' ? assigneeId : null,
        dueDate: dueDate !== '' ? dueDate : null,
        needsApproval,
      };
      if (isApproving) {
        updateData.approvedBy = user?.id ?? null;
        updateData.approvedAt = new Date().toISOString();
      }
      const updated = await updateTask.mutateAsync({
        id: task.id,
        listId: task.listId,
        data: updateData,
      });
      onUpdated?.(updated as unknown as Task);
      onClose();
    } catch {
      // error handled by mutation
    }
  };

  const handleApprove = async () => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        listId: task.listId,
        data: {
          status: 'approved',
          approvedBy: user?.id ?? null,
          approvedAt: new Date().toISOString(),
        },
      });
      setStatus('approved');
      onClose();
    } catch {
      // error handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-right border-l border-gray-100/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/60">
          <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Task Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-semibold text-gray-900 border-0 border-b border-transparent focus:border-gray-200 focus:outline-none py-1 px-0 bg-transparent placeholder-gray-400 transition-all duration-200 tracking-tight"
              placeholder="Task title..."
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100/60">
            <span className="text-sm text-gray-500">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="text-sm border border-gray-200/80 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100/60">
            <span className="text-sm text-gray-500">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="text-sm border border-gray-200/80 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200"
            >
              <option value="">None</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100/60">
            <span className="text-sm text-gray-500">Assignee</span>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="text-sm border border-gray-200/80 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100/60">
            <span className="text-sm text-gray-500">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-sm border border-gray-200/80 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all duration-200"
            />
          </div>

          {/* Needs Approval */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100/60">
            <div>
              <p className="text-sm text-gray-700">Requires approval</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={needsApproval}
              onClick={() => setNeedsApproval((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                needsApproval ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  needsApproval ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Approval info */}
          {task.approvedBy && (
            <div className="bg-green-50/50 rounded-xl p-4 border border-green-100/50">
              <p className="text-sm font-medium text-green-600">✓ Approved</p>
              <p className="text-xs text-gray-500 mt-1">
                {task.approvedAt
                  ? new Date(task.approvedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100/60 flex items-center justify-between bg-gray-50/30">
          {needsApproval && status !== 'approved' && !task.approvedBy && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={updateTask.isPending}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || updateTask.isPending}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTask.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
