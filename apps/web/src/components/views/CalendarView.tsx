import { useMemo, useState } from 'react';
import { useTasks, type Task } from '@/hooks/useQueries';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarViewProps {
  listId: string;
  onSelectTask: (task: Task) => void;
}

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_review: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  done: 'bg-blue-50 text-blue-700',
};

export function CalendarView({ listId, onSelectTask }: CalendarViewProps) {
  const { data: tasks = [], isLoading } = useTasks(listId);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: Array<{ date: Date | null; tasks: Task[] }> = [];

    for (let i = 0; i < startPad; i++) {
      days.push({ date: null, tasks: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateParts = date.toISOString().split('T');
      const dateStr = dateParts[0] ?? '';
      const dayTasks = tasks.filter((t): boolean => {
        if (!t.dueDate) return false;
        return t.dueDate.startsWith(dateStr);
      });
      days.push({ date, tasks: dayTasks });
    }

    return days;
  }, [year, month, tasks]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100/80">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-1 bg-gray-100/60 rounded-xl p-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm"
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-gray-100/80 bg-gray-50/30">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-medium text-gray-400 py-3 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Loading tasks...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto grid grid-cols-7 grid-rows-6">
          {calendarDays.map(({ date, tasks: dayTasks }, idx) => {
            if (!date) {
              return <div key={`pad-${idx}`} className="border-r border-b border-gray-100/60 min-h-28" />;
            }
            const isToday = date.toISOString().split('T')[0] === todayStr;
            return (
              <div
                key={date.toISOString()}
                className={`border-r border-b border-gray-100/60 min-h-28 p-2.5 ${
                  isToday ? 'bg-blue-50/20' : 'hover:bg-gray-50/30 transition-colors duration-200'
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isToday ? 'text-blue-600 bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="mt-1.5 space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      type="button"
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`w-full text-left text-[11px] truncate px-2 py-1 rounded-lg ${STATUS_COLORS[task.status] ?? ''} hover:opacity-80 transition-opacity duration-200`}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-gray-400 pl-2">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
