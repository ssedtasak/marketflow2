import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useTasks } from '@/hooks/useQueries';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const STATUS_COLORS = {
    todo: 'bg-gray-100 text-gray-600',
    in_review: 'bg-yellow-50 text-yellow-700',
    approved: 'bg-green-50 text-green-700',
    done: 'bg-blue-50 text-blue-700',
    // Default for custom statuses
};
export function CalendarView({ listId, onSelectTask }) {
    const { data: tasks = [], isLoading } = useTasks(listId);
    const [currentDate, setCurrentDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = firstDay.getDay();
        const days = [];
        for (let i = 0; i < startPad; i++) {
            days.push({ date: null, tasks: [] });
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const dateParts = date.toISOString().split('T');
            const dateStr = dateParts[0] ?? '';
            const dayTasks = tasks.filter((t) => {
                if (!t.dueDate)
                    return false;
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
    return (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden bg-white", children: [_jsxs("div", { className: "flex items-center justify-between px-8 py-5 border-b border-gray-100/80", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 tracking-tight", children: [MONTHS[month], " ", year] }), _jsxs("div", { className: "flex items-center gap-1 bg-gray-100/60 rounded-xl p-1", children: [_jsx("button", { type: "button", onClick: prevMonth, className: "p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { type: "button", onClick: () => setCurrentDate(new Date()), className: "px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200", children: "Today" }), _jsx("button", { type: "button", onClick: nextMonth, className: "p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5l7 7-7 7" }) }) })] })] }), _jsx("div", { className: "grid grid-cols-7 border-b border-gray-100/80 bg-gray-50/30", children: DAYS.map((d) => (_jsx("div", { className: "text-center text-[11px] font-medium text-gray-400 py-3 uppercase tracking-wide", children: d }, d))) }), isLoading ? (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading tasks..." }) })) : (_jsx("div", { className: "flex-1 overflow-y-auto grid grid-cols-7 grid-rows-6", children: calendarDays.map(({ date, tasks: dayTasks }, idx) => {
                    if (!date) {
                        return _jsx("div", { className: "border-r border-b border-gray-100/60 min-h-28" }, `pad-${idx}`);
                    }
                    const isToday = date.toISOString().split('T')[0] === todayStr;
                    return (_jsxs("div", { className: `border-r border-b border-gray-100/60 min-h-28 p-2.5 ${isToday ? 'bg-blue-50/20' : 'hover:bg-gray-50/30 transition-colors duration-200'}`, children: [_jsx("span", { className: `text-sm font-medium ${isToday ? 'text-blue-600 bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center shadow-sm' : 'text-gray-500'}`, children: date.getDate() }), _jsxs("div", { className: "mt-1.5 space-y-1", children: [dayTasks.slice(0, 3).map((task) => (_jsx("button", { type: "button", onClick: () => onSelectTask(task), className: `w-full text-left text-[11px] truncate px-2 py-1 rounded-lg ${STATUS_COLORS[task.status] ?? 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity duration-200`, children: task.title }, task.id))), dayTasks.length > 3 && (_jsxs("span", { className: "text-[10px] text-gray-400 pl-2", children: ["+", dayTasks.length - 3] }))] })] }, date.toISOString()));
                }) }))] }));
}
