import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks, useUpdateTask } from '@/hooks/useQueries';
const COLUMNS = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_review', label: 'In Review' },
    { id: 'approved', label: 'Approved' },
    { id: 'done', label: 'Done' },
];
function TaskCard({ task, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id: task.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (_jsx("div", { ref: setNodeRef, style: style, className: `bg-white rounded-md border border-gray-100 mb-2 select-none group ${isDragging ? 'opacity-50 ring-2 ring-blue-400 shadow-md' : 'hover:shadow-sm'}`, children: _jsxs("div", { className: "flex items-start gap-2 p-3", children: [_jsx("div", { ...attributes, ...listeners, className: "mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 flex-shrink-0", children: _jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("circle", { cx: "9", cy: "6", r: "1.5" }), _jsx("circle", { cx: "15", cy: "6", r: "1.5" }), _jsx("circle", { cx: "9", cy: "12", r: "1.5" }), _jsx("circle", { cx: "15", cy: "12", r: "1.5" }), _jsx("circle", { cx: "9", cy: "18", r: "1.5" }), _jsx("circle", { cx: "15", cy: "18", r: "1.5" })] }) }), _jsxs("button", { onClick: onClick, className: "flex-1 text-left", children: [_jsx("p", { className: "text-sm text-gray-800 leading-snug", children: task.title }), _jsxs("div", { className: "mt-2 flex items-center gap-2 flex-wrap", children: [task.priority && (_jsx("span", { className: `text-[11px] px-1.5 py-0.5 rounded ${task.priority === 'urgent'
                                        ? 'bg-red-50 text-red-600'
                                        : task.priority === 'high'
                                            ? 'bg-orange-50 text-orange-600'
                                            : 'bg-gray-100 text-gray-500'}`, children: task.priority })), task.dueDate && (_jsx("span", { className: "text-[11px] text-gray-400", children: new Date(task.dueDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    }) })), task.needsApproval && (_jsx("span", { className: "text-[11px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-600", children: task.approvedBy ? '✓' : '⏳' }))] })] })] }) }));
}
function Column({ column, tasks, onTaskClick, }) {
    return (_jsxs("div", { className: "flex flex-col w-64 flex-shrink-0 bg-gray-50/50 rounded-lg", children: [_jsxs("div", { className: "px-3 py-2.5 flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-semibold text-gray-700 uppercase tracking-wide", children: column.label }), _jsx("span", { className: "text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded-full border border-gray-200", children: tasks.length })] }), _jsxs("div", { className: "flex-1 overflow-y-auto px-2 pb-2", children: [_jsx(SortableContext, { items: tasks.map((t) => t.id), strategy: verticalListSortingStrategy, children: tasks.map((task) => (_jsx(TaskCard, { task: task, onClick: () => onTaskClick(task) }, task.id))) }), tasks.length === 0 && (_jsx("div", { className: "border-2 border-dashed border-gray-200 rounded-md p-4 text-center", children: _jsx("p", { className: "text-xs text-gray-400", children: "Drop tasks here" }) }))] })] }));
}
export function KanbanView({ listId, onSelectTask }) {
    const { data: tasks = [], isLoading } = useTasks(listId);
    const updateTask = useUpdateTask();
    const [activeTask, setActiveTask] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const tasksByStatus = COLUMNS.reduce((acc, col) => {
        acc[col.id] = tasks.filter((t) => t.status === col.id);
        return acc;
    }, {});
    const handleDragStart = (event) => {
        const task = tasks.find((t) => t.id === event.active.id);
        if (task)
            setActiveTask(task);
    };
    const handleDragEnd = async (event) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over)
            return;
        const overTask = tasks.find((t) => t.id === over.id);
        const targetStatus = overTask?.status ?? over.id;
        const task = tasks.find((t) => t.id === active.id);
        if (!task)
            return;
        let newStatus = targetStatus;
        if (!COLUMNS.find((c) => c.id === targetStatus)) {
            newStatus = task.status;
        }
        if (newStatus !== task.status) {
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
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading tasks..." }) }));
    }
    return (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden bg-white", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-100", children: _jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Board" }) }), _jsx("div", { className: "flex-1 overflow-x-auto overflow-y-hidden", children: _jsxs(DndContext, { sensors: sensors, collisionDetection: closestCorners, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: [_jsx("div", { className: "flex gap-3 p-6 h-full", children: COLUMNS.map((column) => (_jsx(Column, { column: column, tasks: tasksByStatus[column.id] ?? [], onTaskClick: onSelectTask }, column.id))) }), _jsx(DragOverlay, { children: activeTask && (_jsx("div", { className: "bg-white rounded-md border border-gray-200 p-3 shadow-lg opacity-95", children: _jsx("p", { className: "text-sm font-medium text-gray-900", children: activeTask.title }) })) })] }) })] }));
}
