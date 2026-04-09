import { useState } from 'react';
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask, type Task } from '@/hooks/useQueries';

const STATUS_OPTIONS = ['todo', 'in_review', 'approved', 'done'] as const;
const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_review: 'In Review',
  approved: 'Approved',
  done: 'Done',
};

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
  const [showNewTask, setShowNewTask] = useState(true);

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
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Tasks</h2>
        <button
          onClick={() => setShowNewTask(false)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100"
        >
          <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          New task
        </button>
      </div>

      {/* New task form */}
      {showNewTask && (
        <form
          onSubmit={handleAddTask}
          className="px-6 py-3 border-b border-gray-100 flex gap-2"
        >
          <input
            autoFocus
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="flex-1 text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowNewTask(false)}
            className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white border-b border-gray-100">
            <tr>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-6 py-2.5 w-48">
                Title
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-32">
                Status
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-24">
                Priority
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-28">
                Due Date
              </th>
              <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-16">
                Approval
              </th>
              <th className="px-4 py-2.5 w-16" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 group"
              >
                <td className="px-6 py-3">
                  <button
                    onClick={() => onSelectTask(task)}
                    className="text-sm text-gray-700 hover:text-gray-900 text-left"
                  >
                    {task.title}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      task.priority === 'urgent'
                        ? 'bg-red-50 text-red-600'
                        : task.priority === 'high'
                        ? 'bg-orange-50 text-orange-600'
                        : task.priority === 'normal'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {task.priority ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {task.needsApproval ? (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
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
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(task)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                    title="Delete task"
                  >
                    <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  No tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
