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
    const [selectedTask, setSelectedTask] = useState(null);
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx("p", { className: "text-sm text-gray-400", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "min-h-screen flex bg-gray-50", children: [_jsx(Sidebar, { selectedListId: selectedListId, onSelectList: setSelectedListId, onSelectView: setCurrentView, currentView: currentView }), _jsx("main", { className: "flex-1 flex flex-col overflow-hidden", children: !selectedListId ? (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-400 text-sm mb-1", children: "No list selected" }), _jsx("p", { className: "text-xs text-gray-300", children: "Select a list from the sidebar to view tasks" })] }) })) : currentView === 'calendar' ? (_jsx(CalendarView, { listId: selectedListId, onSelectTask: setSelectedTask })) : currentView === 'list' ? (_jsx(ListView, { listId: selectedListId, onSelectTask: setSelectedTask })) : (_jsx(KanbanView, { listId: selectedListId, onSelectTask: setSelectedTask })) }), selectedTask && (_jsx(TaskDetailPanel, { task: selectedTask, onClose: () => setSelectedTask(null), onUpdated: (updated) => setSelectedTask(updated) }))] }));
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
