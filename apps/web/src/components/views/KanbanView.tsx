import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks, useUpdateTask, type Task } from '@/hooks/useQueries';
import { getAllStatuses, type StatusConfig } from '@/lib/statuses';

interface KanbanViewProps {
  listId: string;
  onSelectTask: (task: Task) => void;
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
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
          </div>
        </button>
      </div>
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: StatusConfig;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-gray-50/50 rounded-2xl">
      {/* Column header */}
      <div className="px-4 py-3.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{column.label}</span>
        <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200/60 font-medium shadow-sm">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[80px] rounded-xl transition-colors duration-200 ${
          isOver ? 'bg-gray-100/80 ring-2 ring-gray-300/50 ring-inset' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
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
  const [columns, setColumns] = useState<StatusConfig[]>(getAllStatuses());

  // Refresh columns from localStorage on mount/focus
  useEffect(() => {
    const refresh = () => setColumns(getAllStatuses());
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columnIds = columns.map((c) => c.id);

  const tasksByStatus = columns.reduce<Record<string, Task[]>>(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    // Determine target status: could be a column ID or a task ID
    let targetStatus: string | undefined;

    if (columnIds.includes(over.id as string)) {
      // Dropped directly on a column (empty column case)
      targetStatus = over.id as string;
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
          collisionDetection={(args) => {
            // Custom collision: check droppable columns first, then default
            const { droppableContainers, active } = args;
            const activeRect = active.rect.current.translated;
            if (!activeRect) return [];

            // Check each column container for overlap
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const collisions: any[] = [];
            for (const container of droppableContainers) {
              const rect = container.rect.current;
              if (!rect) continue;
              if (
                activeRect.left < rect.right &&
                activeRect.right > rect.left &&
                activeRect.top < rect.bottom &&
                activeRect.bottom > rect.top
              ) {
                collisions.push({ id: container.id, data: { value: 0 } });
              }
            }
            return collisions;
          }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 h-full">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id] ?? []}
                onTaskClick={onSelectTask}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xl opacity-95">
                <p className="text-sm font-medium text-gray-900">{activeTask.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
