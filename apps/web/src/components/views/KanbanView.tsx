import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks, useUpdateTask, useList, useWorkspaceMembers, type Task } from '@/hooks/useQueries';
import { useOrderedStatuses, saveColumnOrder, type StatusConfig } from '@/lib/statuses';

interface KanbanViewProps {
  listId: string;
  onSelectTask: (task: Task) => void;
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  assigneeName?: string;
}

function TaskCard({ task, onClick, assigneeName }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-gray-100/80 mb-2 select-none group shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 ring-2 ring-gray-900/20 shadow-lg' : 'hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2.5 p-4">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 flex-shrink-0"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>

        {/* Task content - clickable */}
        <button type="button" onClick={onClick} className="flex-1 text-left">
          <p className="text-sm text-gray-800 leading-snug font-medium">
            {task.title}
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {task.priority && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  task.priority === 'urgent'
                    ? 'bg-red-50 text-red-600'
                    : task.priority === 'high'
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span className="text-[11px] text-gray-400">
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            {task.needsApproval && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 font-medium">
                {task.approvedBy ? '✓' : '⏳'}
              </span>
            )}
            {assigneeName && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-medium border border-gray-100/60">
                {assigneeName}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

interface SortableColumnProps {
  column: StatusConfig;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  assigneeMap: Record<string, string>;
}

function SortableColumn({ column, tasks, onTaskClick, assigneeMap }: SortableColumnProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `col-${column.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`flex flex-col w-72 flex-shrink-0 bg-gray-50/50 rounded-2xl ${
        isDragging ? 'opacity-60 ring-2 ring-gray-300/50' : ''
      }`}
    >
      {/* Column header — draggable for reordering */}
      <div
        {...attributes}
        {...listeners}
        className="px-4 py-3.5 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{column.label}</span>
        <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200/60 font-medium shadow-sm">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area — NOT part of column drag */}
      <div
        ref={setDropRef}
        className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[80px] rounded-xl transition-colors duration-200 ${
          isOver ? 'bg-gray-100/80 ring-2 ring-gray-300/50 ring-inset' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              assigneeName={task.assigneeId ? assigneeMap[task.assigneeId] : undefined}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
            isOver ? 'border-gray-400 bg-gray-100/50' : 'border-gray-200/80'
          }`}>
            <p className="text-xs text-gray-400">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanView({ listId, onSelectTask }: KanbanViewProps) {
  const { data: tasks = [], isLoading } = useTasks(listId);
  const updateTask = useUpdateTask();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const columns = useOrderedStatuses();

  // Get workspace members for assignee names
  const { data: list } = useList(listId);
  const workspaceId = list?.workspaceId;
  const { data: membersData } = useWorkspaceMembers(workspaceId ?? '');
  const members = membersData?.members ?? [];
  const assigneeMap: Record<string, string> = {};
  for (const m of members) {
    assigneeMap[m.userId] = m.name || m.email;
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columnIds = columns.map((c) => c.id);
  const sortableColumnIds = columns.map((c) => `col-${c.id}`);

  const tasksByStatus = columns.reduce<Record<string, Task[]>>(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  // Determine if a dragged item is a column or a task
  const isColumnDrag = (id: UniqueIdentifier): boolean => {
    return typeof id === 'string' && id.startsWith('col-');
  };

  const getColumnIdFromSortable = (id: UniqueIdentifier): string => {
    if (typeof id === 'string' && id.startsWith('col-')) {
      return id.replace('col-', '');
    }
    return id as string;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (isColumnDrag(active.id)) {
      const colId = getColumnIdFromSortable(active.id);
      setActiveColumnId(colId);
    } else {
      const task = tasks.find((t) => t.id === active.id);
      if (task) setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Only for task drags — we handle column reorder in dragEnd
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (isColumnDrag(active.id)) {
      // Column reorder
      setActiveColumnId(null);
      if (!over) return;

      const activeColId = getColumnIdFromSortable(active.id);
      let overIndex: number;

      if (isColumnDrag(over.id)) {
        const overColId = getColumnIdFromSortable(over.id);
        overIndex = columns.findIndex((c) => c.id === overColId);
      } else {
        // Dropped on empty area or task — ignore
        return;
      }

      const activeIndex = columns.findIndex((c) => c.id === activeColId);
      if (activeIndex === overIndex || overIndex === -1) return;

      // Reorder columns
      const newColumns = [...columns];
      const [moved] = newColumns.splice(activeIndex, 1);
      if (!moved) return;
      newColumns.splice(overIndex, 0, moved);
      saveColumnOrder(newColumns.map((c) => c.id));
      return;
    }

    // Task drag
    setActiveTask(null);
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    // Determine target status: could be a column ID or a task ID
    let targetStatus: string | undefined;

    if (columnIds.includes(over.id as string)) {
      // Dropped directly on a column (empty column case)
      targetStatus = over.id as string;
    } else if (isColumnDrag(over.id)) {
      // Dropped on a column header
      targetStatus = getColumnIdFromSortable(over.id);
    } else {
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
      } catch {
        // error handled by mutation
      }
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
      <div className="px-8 py-5 border-b border-gray-100/80">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Board</h2>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableColumnIds} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 p-6 h-full">
              {columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByStatus[column.id] ?? []}
                  onTaskClick={onSelectTask}
                  assigneeMap={assigneeMap}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeTask && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xl opacity-95">
                <p className="text-sm font-medium text-gray-900">{activeTask.title}</p>
              </div>
            )}
            {activeColumnId && (
              <div className="w-72 bg-gray-50/50 rounded-2xl border-2 border-gray-300/50 p-4 shadow-xl opacity-80">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {columns.find((c) => c.id === activeColumnId)?.label}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
