import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { VerifyRedirect } from '@/components/auth/VerifyRedirect';
import { Sidebar } from '@/components/hierarchy/Sidebar';
import { CalendarView } from '@/components/views/CalendarView';
import { ListView } from '@/components/views/ListView';
import { KanbanView } from '@/components/views/KanbanView';
import { TaskDetailPanel } from '@/components/views/TaskDetailPanel';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60,
        },
    },
});
function AuthenticatedApp() {
    const { isLoading } = useAuth();
    const [currentView, setCurrentView] = useState('list');
    const [selectedListId, setSelectedListId] = useState(null);
    const handleSelectList = (listId) => {
        setSelectedListId(listId || null);
    };
    const [selectedTask, setSelectedTask] = useState(null);
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "flex flex-col items-center gap-3 animate-fade-in", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center", children: _jsx("svg", { className: "h-4 w-4 text-gray-400 animate-spin", viewBox: "0 0 24 24", fill: "none", children: _jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", strokeDasharray: "60 30" }) }) }), _jsx("p", { className: "text-sm text-gray-400", children: "Loading..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen flex bg-white", children: [_jsx(Sidebar, { selectedListId: selectedListId, onSelectList: handleSelectList, onSelectView: setCurrentView, currentView: currentView }), _jsx("main", { className: "flex-1 flex flex-col overflow-hidden min-h-screen", children: !selectedListId ? (_jsx(HeroLanding, {})) : currentView === 'calendar' ? (_jsx(CalendarView, { listId: selectedListId, onSelectTask: setSelectedTask })) : currentView === 'list' ? (_jsx(ListView, { listId: selectedListId, onSelectTask: setSelectedTask })) : (_jsx(KanbanView, { listId: selectedListId, onSelectTask: setSelectedTask })) }), selectedTask && (_jsx(TaskDetailPanel, { task: selectedTask, onClose: () => setSelectedTask(null), onUpdated: (updated) => setSelectedTask(updated) }))] }));
}
function HeroLanding() {
    return (_jsxs("div", { className: "flex-1 flex items-center justify-center relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white pointer-events-none" }), _jsxs("div", { className: "text-center max-w-xl mx-auto px-6 animate-fade-in", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/50 flex items-center justify-center mx-auto mb-8 shadow-sm", children: _jsxs("svg", { width: "28", height: "28", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M2 12L8 4L14 12", stroke: "gray", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M5 12L8 7L11 12", stroke: "gray", strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round", opacity: "0.5" })] }) }), _jsx("h1", { className: "apple-section-title mb-3", children: "MarketFlow" }), _jsx("p", { className: "apple-section-subtitle mb-8", children: "Your marketing projects, organized beautifully." }), _jsx("p", { className: "text-sm text-gray-400", children: "Select a list from the sidebar to get started." })] })] }));
}
function AppContent() {
    const { user, token } = useAuth();
    // Handle magic link verification redirect
    const urlParams = new URLSearchParams(window.location.search);
    const hasToken = urlParams.has('token');
    if (hasToken) {
        return _jsx(VerifyRedirect, {});
    }
    if (!user || !token) {
        return _jsx(MagicLinkForm, {});
    }
    return _jsx(AuthenticatedApp, {});
}
export default function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(AppContent, {}) }) }));
}
