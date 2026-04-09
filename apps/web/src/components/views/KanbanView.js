import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable, closestCorners, } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks, useUpdateTask, useList, useWorkspaceMembers } from '@/hooks/useQueries';
import { useOrderedStatuses, saveColumnOrder } from '@/lib/statuses';
function TaskCard({ task, onClick, assigneeName }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id: task.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (_jsx("div", { ref: setNodeRef, style: style, className: `bg-white rounded-xl border border-gray-100/80 mb-2 select-none group shadow-sm hover:shadow-md transition-all duration-200 ${isDragging ? 'opacity-50 ring-2 ring-gray-900/20 shadow-lg' : 'hover:border-gray-200'}`, children: _jsxs("div", { className: "flex items-start gap-2.5 p-4", children: [_jsx("div", { ...attributes, ...listeners, className: "mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 flex-shrink-0", children: _jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("circle", { cx: "9", cy: "6", r: "1.5" }), _jsx("circle", { cx: "15", cy: "6", r: "1.5" }), _jsx("circle", { cx: "9", cy: "12", r: "1.5" }), _jsx("circle", { cx: "15", cy: "12", r: "1.5" }), _jsx("circle", { cx: "9", cy: "18", r: "1.5" }), _jsx("circle", { cx: "15", cy: "18", r: "1.5" })] }) }), _jsxs("button", { type: "button", onClick: onClick, className: "flex-1 text-left", children: [_jsx("p", { className: "text-sm text-gray-800 leading-snug font-medium", children: task.title }), _jsxs("div", { className: "mt-2.5 flex items-center gap-2 flex-wrap", children: [task.priority && (_jsx("span", { className: `text-[11px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'urgent'
                                        ? 'bg-red-50 text-red-600'
                                        : task.priority === 'high'
                                            ? 'bg-orange-50 text-orange-600'
                                            : 'bg-gray-100 text-gray-500'}`, children: task.priority })), task.dueDate && (_jsx("span", { className: "text-[11px] text-gray-400", children: new Date(task.dueDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    }) })), task.needsApproval && (_jsx("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 font-medium", children: task.approvedBy ? '✓' : '⏳' })), assigneeName && (_jsx("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium border border-gray-100/60", children: assigneeName }))] })] })] }) }));
}
function SortableColumn({ column, tasks, onTaskClick, assigneeMap }) {
    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id });
    const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging, } = useSortable({ id: `col-${column.id}` });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (_jsxs("div", { ref: setSortableRef, style: style, className: `flex flex-col w-72 flex-shrink-0 bg-gray-50/50 rounded-2xl ${isDragging ? 'opacity-60 ring-2 ring-gray-300/50' : ''}`, children: [_jsxs("div", { ...attributes, ...listeners, className: "px-4 py-3.5 flex items-center justify-between cursor-grab active:cursor-grabbing select-none", children: [_jsx("span", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wide", children: column.label }), _jsx("span", { className: "text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200/60 font-medium shadow-sm", children: tasks.length })] }), _jsxs("div", { ref: setDropRef, className: `flex-1 overflow-y-auto px-3 pb-3 min-h-[80px] rounded-xl transition-colors duration-200 ${isOver ? 'bg-gray-100/80 ring-2 ring-gray-300/50 ring-inset' : ''}`, children: [_jsx(SortableContext, { items: tasks.map((t) => t.id), strategy: verticalListSortingStrategy, children: tasks.map((task) => (_jsx(TaskCard, { task: task, onClick: () => onTaskClick(task), assigneeName: task.assigneeId ? assigneeMap[task.assigneeId] : undefined }, task.id))) }), tasks.length === 0 && (_jsx("div", { className: `border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${isOver ? 'border-gray-400 bg-gray-100/50' : 'border-gray-200/80'}`, children: _jsx("p", { className: "text-xs text-gray-400", children: "Drop tasks here" }) }))] })] }));
}
export function KanbanView({ listId, onSelectTask }) {
    const { data: tasks = [], isLoading } = useTasks(listId);
    const updateTask = useUpdateTask();
    const [activeTask, setActiveTask] = useState(null);
    const [activeColumnId, setActiveColumnId] = useState(null);
    const columns = useOrderedStatuses();
    // Get workspace members for assignee names
    const { data: list } = useList(listId);
    const workspaceId = list?.workspaceId;
    const { data: membersData } = useWorkspaceMembers(workspaceId ?? '');
    const members = membersData?.members ?? [];
    const assigneeMap = {};
    for (const m of members) {
        assigneeMap[m.userId] = m.name || m.email;
    }
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const columnIds = columns.map((c) => c.id);
    const sortableColumnIds = columns.map((c) => `col-${c.id}`);
    const tasksByStatus = columns.reduce((acc, col) => {
        acc[col.id] = tasks.filter((t) => t.status === col.id);
        return acc;
    }, {});
    // Determine if a dragged item is a column or a task
    const isColumnDrag = (id) => {
        return typeof id === 'string' && id.startsWith('col-');
    };
    const getColumnIdFromSortable = (id) => {
        if (typeof id === 'string' && id.startsWith('col-')) {
            return id.replace('col-', '');
        }
        return id;
    };
    const handleDragStart = (event) => {
        const { active } = event;
        if (isColumnDrag(active.id)) {
            const colId = getColumnIdFromSortable(active.id);
            setActiveColumnId(colId);
        }
        else {
            const task = tasks.find((t) => t.id === active.id);
            if (task)
                setActiveTask(task);
        }
    };
    const handleDragOver = (event) => {
        // Only for task drags — we handle column reorder in dragEnd
    };
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (isColumnDrag(active.id)) {
            // Column reorder
            setActiveColumnId(null);
            if (!over)
                return;
            const activeColId = getColumnIdFromSortable(active.id);
            let overIndex;
            if (isColumnDrag(over.id)) {
                const overColId = getColumnIdFromSortable(over.id);
                overIndex = columns.findIndex((c) => c.id === overColId);
            }
            else {
                // Dropped on empty area or task — ignore
                return;
            }
            const activeIndex = columns.findIndex((c) => c.id === activeColId);
            if (activeIndex === overIndex || overIndex === -1)
                return;
            // Reorder columns
            const newColumns = [...columns];
            const [moved] = newColumns.splice(activeIndex, 1);
            if (!moved)
                return;
            newColumns.splice(overIndex, 0, moved);
            saveColumnOrder(newColumns.map((c) => c.id));
            return;
        }
        // Task drag
        setActiveTask(null);
        if (!over)
            return;
        const task = tasks.find((t) => t.id === active.id);
        if (!task)
            return;
        // Determine target status: could be a column ID or a task ID
        let targetStatus;
        if (columnIds.includes(over.id)) {
            // Dropped directly on a column (empty column case)
            targetStatus = over.id;
        }
        else if (isColumnDrag(over.id)) {
            // Dropped on a column header
            targetStatus = getColumnIdFromSortable(over.id);
        }
        else {
            // Dropped on a task — use that task's status
            const overTask = tasks.find((t) => t.id === over.id);
            targetStatus = overTask?.status;
        }
        if (targetStatus && targetStatus !== task.status) {
            try {
                await updateTask.mutateAsync({
                    id: task.id,
                    listId,
                    data: { status: targetStatus },
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
    return (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden bg-white", children: [_jsx("div", { className: "px-8 py-5 border-b border-gray-100/80", children: _jsx("h2", { className: "text-lg font-semibold text-gray-900 tracking-tight", children: "Board" }) }), _jsx("div", { className: "flex-1 overflow-x-auto overflow-y-hidden", children: _jsxs(DndContext, { sensors: sensors, collisionDetection: closestCorners, onDragStart: handleDragStart, onDragOver: handleDragOver, onDragEnd: handleDragEnd, children: [_jsx(SortableContext, { items: sortableColumnIds, strategy: horizontalListSortingStrategy, children: _jsx("div", { className: "flex gap-4 p-6 h-full", children: columns.map((column) => (_jsx(SortableColumn, { column: column, tasks: tasksByStatus[column.id] ?? [], onTaskClick: onSelectTask, assigneeMap: assigneeMap }, column.id))) }) }), _jsxs(DragOverlay, { children: [activeTask && (_jsx("div", { className: "bg-white rounded-xl border border-gray-200 p-4 shadow-xl opacity-95", children: _jsx("p", { className: "text-sm font-medium text-gray-900", children: activeTask.title }) })), activeColumnId && (_jsx("div", { className: "w-72 bg-gray-50/50 rounded-2xl border-2 border-gray-300/50 p-4 shadow-xl opacity-80", children: _jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wide", children: columns.find((c) => c.id === activeColumnId)?.label }) }))] })] }) })] }));
}
