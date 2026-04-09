import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask } from '@/hooks/useQueries';
const STATUS_OPTIONS = ['todo', 'in_review', 'approved', 'done'];
const STATUS_LABELS = {
    todo: 'To Do',
    in_review: 'In Review',
    approved: 'Approved',
    done: 'Done',
};
export function ListView({ listId, onSelectTask }) {
    const { data: tasks = [], isLoading } = useTasks(listId);
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const createTask = useCreateTask();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showNewTask, setShowNewTask] = useState(true);
    const handleStatusChange = async (task, newStatus) => {
        try {
            await updateTask.mutateAsync({
                id: task.id,
                listId,
                data: { status: newStatus },
            });
        }
        catch {
            // error handled by mutation
        }
    };
    const handleDelete = async (task) => {
        if (!confirm(`Delete "${task.title}"?`))
            return;
        try {
            await deleteTask.mutateAsync({ id: task.id, listId });
        }
        catch {
            // error handled by mutation
        }
    };
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim())
            return;
        try {
            await createTask.mutateAsync({
                listId,
                title: newTaskTitle.trim(),
            });
            setNewTaskTitle('');
            setShowNewTask(false);
        }
        catch {
            // error handled
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading tasks..." }) }));
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden bg-white", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between", children: [_jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Tasks" }), _jsxs("button", { onClick: () => setShowNewTask(false), className: "text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100", children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }), "New task"] })] }), showNewTask && (_jsxs("form", { onSubmit: handleAddTask, className: "px-6 py-3 border-b border-gray-100 flex gap-2", children: [_jsx("input", { autoFocus: true, value: newTaskTitle, onChange: (e) => setNewTaskTitle(e.target.value), placeholder: "Task title...", className: "flex-1 text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" }), _jsx("button", { type: "submit", className: "px-3 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800", children: "Add" }), _jsx("button", { type: "button", onClick: () => setShowNewTask(false), className: "px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded", children: "Cancel" })] })), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "sticky top-0 bg-white border-b border-gray-100", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-6 py-2.5 w-48", children: "Title" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-32", children: "Status" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-24", children: "Priority" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-28", children: "Due Date" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-2.5 w-16", children: "Approval" }), _jsx("th", { className: "px-4 py-2.5 w-16" })] }) }), _jsxs("tbody", { children: [tasks.map((task) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50/50 group", children: [_jsx("td", { className: "px-6 py-3", children: _jsx("button", { onClick: () => onSelectTask(task), className: "text-sm text-gray-700 hover:text-gray-900 text-left", children: task.title }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("select", { value: task.status, onChange: (e) => handleStatusChange(task, e.target.value), className: "text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer", children: STATUS_OPTIONS.map((s) => (_jsx("option", { value: s, children: STATUS_LABELS[s] }, s))) }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `text-[11px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'urgent'
                                                    ? 'bg-red-50 text-red-600'
                                                    : task.priority === 'high'
                                                        ? 'bg-orange-50 text-orange-600'
                                                        : task.priority === 'normal'
                                                            ? 'bg-gray-100 text-gray-600'
                                                            : 'bg-gray-100 text-gray-400'}`, children: task.priority ?? '—' }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-500", children: task.dueDate
                                                ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : '—' }), _jsx("td", { className: "px-4 py-3", children: task.needsApproval ? (_jsx("span", { className: `text-[11px] px-2 py-0.5 rounded-full font-medium ${task.approvedBy
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-yellow-50 text-yellow-600'}`, children: task.approvedBy ? 'Approved' : 'Pending' })) : (_jsx("span", { className: "text-xs text-gray-300", children: "\u2014" })) }), _jsx("td", { className: "px-4 py-3", children: _jsx("button", { onClick: () => handleDelete(task), className: "text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100", title: "Delete task", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) }) })] }, task.id))), tasks.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "px-6 py-12 text-center text-sm text-gray-400", children: "No tasks yet." }) }))] })] }) })] }));
}
