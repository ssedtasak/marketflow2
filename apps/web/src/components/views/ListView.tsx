import { useState } from 'react';
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask, type Task } from '@/hooks/useQueries';
import { getAllStatuses } from '@/lib/statuses';

const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'] as const;

interface ListViewProps {
  listId: string;
  onSelectTask: (task: Task) => void;
}

export function ListView({ listId, onSelectTask }: ListViewProps) {
  const { data: tasks = [], isLoading } = useTasks(listId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);

  const statuses = getAllStatuses();

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        listId,
        data: { status: newStatus },
      });
    } catch {
      // error handled by mutation
    }
  };

  const handlePriorityChange = async (task: Task, newPriority: string) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        listId,
        data: { priority: newPriority || undefined },
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleDueDateChange = async (task: Task, newDueDate: string) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        listId,
        data: { dueDate: newDueDate || null },
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteTask.mutateAsync({ id: task.id, listId });
    } catch {
      // error handled by mutation
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        listId,
        title: newTaskTitle.trim(),
      });
      setNewTaskTitle('');
      setShowNewTask(false);
    } catch {
      // error handled
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100/80 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Tasks</h2>
        <button
          type="button"
          onClick={() => setShowNewTask(true)}
          className="apple-btn-primary flex items-center gap-2"
        >
          <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New task
        </button>
      </div>

      {/* New task form */}
      {showNewTask && (
        <form
          onSubmit={handleAddTask}
          className="px-8 py-4 border-b border-gray-100/80 flex gap-3 bg-gray-50/30 animate-fade-in"
        >
          <input
            autoFocus
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="flex-1 apple-input"
          />
          <button
            type="submit"
            className="apple-btn-primary"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowNewTask(false)}
            className="apple-btn-secondary"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white border-b border-gray-100/80">
            <tr>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-8 py-3 w-48">
                Title
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-32">
                Status
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-24">
                Priority
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-28">
                Due Date
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-16">
                Approval
              </th>
              <th className="px-4 py-3 w-16" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr
                key={task.id}
                className="border-b border-gray-100/60 hover:bg-gray-50/50 group transition-colors duration-200"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <td className="px-8 py-3.5">
                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="text-sm text-gray-700 hover:text-gray-900 text-left font-medium"
                  >
                    {task.title}
                  </button>
                </td>
                <td className="px-4 py-3.5">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className="text-xs border border-gray-200/80 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <select
                    value={task.priority ?? ''}
                    onChange={(e) => handlePriorityChange(task, e.target.value)}
                    className={`text-xs border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200 ${
                      task.priority === 'urgent'
                        ? 'border-red-200/80 text-red-600'
                        : task.priority === 'high'
                        ? 'border-orange-200/80 text-orange-600'
                        : 'border-gray-200/80 text-gray-600'
                    }`}
                  >
                    <option value="">None</option>
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3.5">
                  <input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDueDateChange(task, e.target.value)}
                    className="text-xs border border-gray-200/80 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200 text-gray-500"
                  />
                </td>
                <td className="px-4 py-3.5">
                  {task.needsApproval ? (
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        task.approvedBy
                          ? 'bg-green-50 text-green-600'
                          : 'bg-yellow-50 text-yellow-600'
                      }`}
                    >
                      {task.approvedBy ? 'Approved' : 'Pending'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => handleDelete(task)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-50"
                    title="Delete task"
                  >
                    <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-sm text-gray-400">
                  No tasks yet. Create your first task above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
