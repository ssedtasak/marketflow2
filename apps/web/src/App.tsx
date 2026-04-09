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
import type { Task } from '@/hooks/useQueries';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

type View = 'calendar' | 'list' | 'kanban';

function AuthenticatedApp() {
  const { isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        selectedListId={selectedListId}
        onSelectList={setSelectedListId}
        onSelectView={setCurrentView}
        currentView={currentView}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {!selectedListId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">No list selected</p>
              <p className="text-xs text-gray-300">
                Select a list from the sidebar to view tasks
              </p>
            </div>
          </div>
        ) : currentView === 'calendar' ? (
          <CalendarView
            listId={selectedListId}
            onSelectTask={setSelectedTask}
          />
        ) : currentView === 'list' ? (
          <ListView
            listId={selectedListId}
            onSelectTask={setSelectedTask}
          />
        ) : (
          <KanbanView
            listId={selectedListId}
            onSelectTask={setSelectedTask}
          />
        )}
      </main>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={(updated) => setSelectedTask(updated)}
        />
      )}
    </div>
  );
}

function AppContent() {
  const { user, token } = useAuth();

  // Handle magic link verification redirect
  const urlParams = new URLSearchParams(window.location.search);
  const hasToken = urlParams.has('token');

  if (hasToken) {
    return <VerifyRedirect />;
  }

  if (!user || !token) {
    return <MagicLinkForm />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
