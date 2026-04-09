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
  const handleSelectList = (listId: string) => {
    setSelectedListId(listId || null);
  };
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60 30" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        selectedListId={selectedListId}
        onSelectList={handleSelectList}
        onSelectView={setCurrentView}
        currentView={currentView}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-h-screen">
        {!selectedListId ? (
          <HeroLanding />
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

function HeroLanding() {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-white to-white pointer-events-none" />
      
      <div className="text-center max-w-xl mx-auto px-6 animate-fade-in">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/50 flex items-center justify-center mx-auto mb-8 shadow-sm">
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12L8 4L14 12" stroke="gray" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12L8 7L11 12" stroke="gray" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
        
        <h1 className="apple-section-title mb-3">MarketFlow</h1>
        <p className="apple-section-subtitle mb-8">
          Your marketing projects, organized beautifully.
        </p>
        <p className="text-sm text-gray-400">
          Select a list from the sidebar to get started.
        </p>
      </div>
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
