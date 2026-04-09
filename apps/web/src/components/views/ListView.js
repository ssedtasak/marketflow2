import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTasks, useUpdateTask, useDeleteTask, useCreateTask, useList, useWorkspaceMembers } from '@/hooks/useQueries';
import { useAllStatuses } from '@/lib/statuses';
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'];
export function ListView({ listId, onSelectTask }) {
    const { data: tasks = [], isLoading } = useTasks(listId);
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const createTask = useCreateTask();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showNewTask, setShowNewTask] = useState(false);
    const statuses = useAllStatuses();
    // Get workspace members for assignee resolution
    const { data: list } = useList(listId);
    const workspaceId = list?.workspaceId;
    const { data: membersData } = useWorkspaceMembers(workspaceId ?? '');
    const members = membersData?.members ?? [];
    const assigneeMap = {};
    for (const m of members) {
        assigneeMap[m.userId] = m.name || m.email;
    }
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
    const handlePriorityChange = async (task, newPriority) => {
        try {
            await updateTask.mutateAsync({
                id: task.id,
                listId,
                data: { priority: newPriority || undefined },
            });
        }
        catch {
            // error handled by mutation
        }
    };
    const handleDueDateChange = async (task, newDueDate) => {
        try {
            await updateTask.mutateAsync({
                id: task.id,
                listId,
                data: { dueDate: newDueDate || null },
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
    return (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden bg-white", children: [_jsxs("div", { className: "px-8 py-5 border-b border-gray-100/80 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 tracking-tight", children: "Tasks" }), _jsxs("button", { type: "button", onClick: () => setShowNewTask(true), className: "apple-btn-primary flex items-center gap-2", children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "New task"] })] }), showNewTask && (_jsxs("form", { onSubmit: handleAddTask, className: "px-8 py-4 border-b border-gray-100/80 flex gap-3 bg-gray-50/30 animate-fade-in", children: [_jsx("input", { autoFocus: true, value: newTaskTitle, onChange: (e) => setNewTaskTitle(e.target.value), placeholder: "Task title...", className: "flex-1 apple-input" }), _jsx("button", { type: "submit", className: "apple-btn-primary", children: "Add" }), _jsx("button", { type: "button", onClick: () => setShowNewTask(false), className: "apple-btn-secondary", children: "Cancel" })] })), _jsx("div", { className: "flex-1 overflow-y-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "sticky top-0 bg-white border-b border-gray-100/80", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-8 py-3 w-48", children: "Title" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-32", children: "Status" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-24", children: "Priority" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-28", children: "Due Date" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-32", children: "Assignee" }), _jsx("th", { className: "text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-16", children: "Approval" }), _jsx("th", { className: "px-4 py-3 w-16" })] }) }), _jsxs("tbody", { children: [tasks.map((task, idx) => (_jsxs("tr", { className: "border-b border-gray-100/60 hover:bg-gray-50/50 group transition-colors duration-200", style: { animationDelay: `${idx * 30}ms` }, children: [_jsx("td", { className: "px-8 py-3.5", children: _jsx("button", { type: "button", onClick: () => onSelectTask(task), className: "text-sm text-gray-700 hover:text-gray-900 text-left font-medium", children: task.title }) }), _jsx("td", { className: "px-4 py-3.5", children: _jsx("select", { value: task.status, onChange: (e) => handleStatusChange(task, e.target.value), className: "text-xs border border-gray-200/80 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200", children: statuses.map((s) => (_jsx("option", { value: s.id, children: s.label }, s.id))) }) }), _jsx("td", { className: "px-4 py-3.5", children: _jsxs("select", { value: task.priority ?? '', onChange: (e) => handlePriorityChange(task, e.target.value), className: `text-xs border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200 ${task.priority === 'urgent'
                                                    ? 'border-red-200/80 text-red-600'
                                                    : task.priority === 'high'
                                                        ? 'border-orange-200/80 text-orange-600'
                                                        : 'border-gray-200/80 text-gray-600'}`, children: [_jsx("option", { value: "", children: "None" }), PRIORITY_OPTIONS.map((p) => (_jsx("option", { value: p, children: p.charAt(0).toUpperCase() + p.slice(1) }, p)))] }) }), _jsx("td", { className: "px-4 py-3.5", children: _jsx("input", { type: "date", value: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '', onChange: (e) => handleDueDateChange(task, e.target.value), className: "text-xs border border-gray-200/80 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer transition-all duration-200 text-gray-500" }) }), _jsx("td", { className: "px-4 py-3.5", children: task.assigneeId && assigneeMap[task.assigneeId] ? (_jsx("span", { className: "text-xs text-gray-600 font-medium", children: assigneeMap[task.assigneeId] })) : (_jsx("span", { className: "text-xs text-gray-300", children: "\u2014" })) }), _jsx("td", { className: "px-4 py-3.5", children: task.needsApproval ? (_jsx("span", { className: `text-[11px] px-2.5 py-1 rounded-full font-medium ${task.approvedBy
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-yellow-50 text-yellow-600'}`, children: task.approvedBy ? 'Approved' : 'Pending' })) : (_jsx("span", { className: "text-xs text-gray-300", children: "\u2014" })) }), _jsx("td", { className: "px-4 py-3.5", children: _jsx("button", { type: "button", onClick: () => handleDelete(task), className: "text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-50", title: "Delete task", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) }) })] }, task.id))), tasks.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-8 py-16 text-center text-sm text-gray-400", children: "No tasks yet. Create your first task above." }) }))] })] }) })] }));
}
