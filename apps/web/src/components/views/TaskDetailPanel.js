import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUpdateTask, useList, useWorkspaceMembers } from '@/hooks/useQueries';
import { useAuth } from '@/lib/auth-context';
const STATUS_OPTIONS = ['todo', 'in_review', 'approved', 'done'];
const STATUS_LABELS = {
    todo: 'To Do',
    in_review: 'In Review',
    approved: 'Approved',
    done: 'Done',
};
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'];
export function TaskDetailPanel({ task, onClose, onUpdated }) {
    const { user } = useAuth();
    const updateTask = useUpdateTask();
    // Fetch list to get workspaceId
    const { data: list } = useList(task.listId);
    const workspaceId = list?.workspaceId;
    // Fetch workspace members for assignee dropdown
    const { data: membersData } = useWorkspaceMembers(workspaceId ?? '');
    const members = membersData?.members ?? [];
    const [title, setTitle] = useState(task.title);
    const [status, setStatus] = useState(task.status);
    const [priority, setPriority] = useState(task.priority ?? '');
    const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? '');
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
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
        const dirty = title !== task.title ||
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
            const updateData = {
                title: title !== task.title ? title : undefined,
                status: status !== task.status ? status : undefined,
                priority: priority !== '' ? priority : undefined,
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
            onUpdated?.(updated);
            onClose();
        }
        catch {
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
        }
        catch {
            // error handled
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex justify-end", children: [_jsx("div", { className: "absolute inset-0 bg-black/20 backdrop-blur-[2px]", onClick: onClose }), _jsxs("div", { className: "relative w-full max-w-md bg-white shadow-xl flex flex-col overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-100", children: [_jsx("h2", { className: "text-sm font-semibold text-gray-900", children: "Task Details" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto px-5 py-4 space-y-4", children: [_jsx("div", { children: _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), className: "w-full text-sm text-gray-900 border-0 border-b border-transparent focus:border-gray-200 focus:outline-none py-1 px-0 bg-transparent placeholder-gray-400", placeholder: "Task title..." }) }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Assignee" }), _jsxs("select", { value: assigneeId, onChange: (e) => setAssigneeId(e.target.value), className: "text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer", children: [_jsx("option", { value: "", children: "Unassigned" }), members.map((member) => (_jsx("option", { value: member.userId, children: member.name || member.email }, member.userId)))] })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Status" }), _jsx("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer", children: STATUS_OPTIONS.map((s) => (_jsx("option", { value: s, children: STATUS_LABELS[s] }, s))) })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Priority" }), _jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), className: "text-sm border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer", children: [_jsx("option", { value: "", children: "None" }), PRIORITY_OPTIONS.map((p) => (_jsx("option", { value: p, children: p.charAt(0).toUpperCase() + p.slice(1) }, p)))] })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Due date" }), _jsx("input", { type: "date", value: dueDate, onChange: (e) => setDueDate(e.target.value), className: "text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400" })] }), _jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-100", children: [_jsx("div", { children: _jsx("p", { className: "text-sm text-gray-700", children: "Requires approval" }) }), _jsx("button", { role: "switch", "aria-checked": needsApproval, onClick: () => setNeedsApproval((v) => !v), className: `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${needsApproval ? 'bg-gray-900' : 'bg-gray-200'}`, children: _jsx("span", { className: `inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${needsApproval ? 'translate-x-4' : 'translate-x-1'}` }) })] }), task.approvedBy && (_jsxs("div", { className: "bg-gray-50 rounded-md p-3", children: [_jsx("p", { className: "text-xs font-medium text-gray-700", children: "\u2713 Approved" }), _jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: task.approvedAt
                                            ? new Date(task.approvedAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : '' })] }))] }), _jsxs("div", { className: "px-5 py-3 border-t border-gray-100 flex items-center justify-between", children: [needsApproval && status !== 'approved' && !task.approvedBy && (_jsx("button", { onClick: handleApprove, disabled: updateTask.isPending, className: "px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50", children: "Approve" })), _jsxs("div", { className: "flex gap-2 ml-auto", children: [_jsx("button", { onClick: onClose, className: "px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded", children: "Cancel" }), _jsx("button", { onClick: handleSave, disabled: !isDirty || updateTask.isPending, className: "px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed", children: updateTask.isPending ? 'Saving...' : 'Save' })] })] })] })] }));
}
