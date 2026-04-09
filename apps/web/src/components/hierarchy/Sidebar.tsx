import { useState, useEffect } from 'react';
import { useWorkspaces, useLists, useCreateWorkspace, useCreateList } from '@/hooks/useQueries';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string) => void;
  onSelectView: (view: 'calendar' | 'list' | 'kanban') => void;
  currentView: 'calendar' | 'list' | 'kanban';
}

export function Sidebar({
  selectedListId,
  onSelectList,
  onSelectView,
  currentView,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces();
  const [selectedWsId, setSelectedWsId] = useState<string | null>(
    workspaces[0]?.id ?? null
  );
  const { data: lists = [], isLoading: listsLoading } = useLists(selectedWsId ?? '');

  // Update selectedWsId when workspaces load
  useEffect(() => {
    if (!selectedWsId && workspaces.length > 0) {
      setSelectedWsId(workspaces[0].id);
    }
  }, [selectedWsId, workspaces]);

  const [showNewWs, setShowNewWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const createWs = useCreateWorkspace();
  const createList = useCreateList();

  const handleCreateWs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const ws = await createWs.mutateAsync(newWsName.trim());
      setSelectedWsId(ws.id);
      setNewWsName('');
      setShowNewWs(false);
    } catch {
      // error handled by mutation
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !selectedWsId) return;
    try {
      await createList.mutateAsync({ workspaceId: selectedWsId, name: newListName.trim() });
      setNewListName('');
      setShowNewList(false);
    } catch {
      // error handled by mutation
    }
  };

  return (
    <aside className="w-56 min-h-screen bg-gray-50/80 border-r border-gray-100/80 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12L8 4L14 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12L8 7L11 12" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 tracking-tight">MarketFlow</h1>
              {user && (
                <p className="text-[10px] text-gray-400 truncate max-w-28">{user.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-gray-300 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200"
            title="Sign out"
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-3 border-b border-gray-100/60">
        <select
          value={selectedWsId ?? ''}
          onChange={(e) => setSelectedWsId(e.target.value || null)}
          className="w-full text-sm bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200 cursor-pointer"
        >
          {wsLoading && <option className="bg-white">Loading...</option>}
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id} className="bg-white">
              {ws.name}
            </option>
          ))}
        </select>
        {showNewWs && (
          <form onSubmit={handleCreateWs} className="mt-2.5 flex gap-1.5">
            <input
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Workspace name"
              className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200"
            />
            <button 
              type="submit" 
              className="px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewWs(false)}
              className="px-2 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              ✕
            </button>
          </form>
        )}
        {!showNewWs && (
          <button
            type="button"
            onClick={() => setShowNewWs(true)}
            className="mt-2.5 w-full text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200"
          >
            <svg className="h-3.5 w-3.5" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New workspace
          </button>
        )}
      </div>

      {/* View switcher */}
      <div className="px-3 py-3 border-b border-gray-100/60">
        <p className="text-[10px] font-medium text-gray-300 uppercase tracking-wider mb-2 px-2">View</p>
        <div className="flex gap-1 bg-gray-100/60 rounded-xl p-1">
          <button
            type="button"
            key="calendar"
            onClick={() => onSelectView('calendar')}
            title="Calendar"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all duration-200 ${
              currentView === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
            }`}
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">Calendar</span>
          </button>
          <button
            type="button"
            key="list"
            onClick={() => onSelectView('list')}
            title="List"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all duration-200 ${
              currentView === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
            }`}
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-[10px] font-medium">List</span>
          </button>
          <button
            type="button"
            key="kanban"
            onClick={() => onSelectView('kanban')}
            title="Kanban"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all duration-200 ${
              currentView === 'kanban'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
            }`}
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5v6m-3-3h6m-3 9v2m-6-6h12M6 5v14" />
            </svg>
            <span className="text-[10px] font-medium">Board</span>
          </button>
        </div>
      </div>

      {/* Lists */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">
            Lists
          </span>
          <button
            type="button"
            onClick={() => setShowNewList(true)}
            className="text-gray-300 hover:text-gray-500 p-1 rounded-md hover:bg-gray-100/80 transition-all duration-200"
            title="New list"
          >
            <svg className="h-3.5 w-3.5" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {showNewList && (
          <form onSubmit={handleCreateList} className="mb-2.5 flex gap-1.5">
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
              className="flex-1 text-xs bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200"
            />
            <button 
              type="submit" 
              className="px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewList(false)}
              className="px-2 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              ✕
            </button>
          </form>
        )}

        {listsLoading && (
          <p className="text-xs text-gray-300 px-2 py-2">Loading...</p>
        )}

        {lists.map((list) => (
          <button
            type="button"
            key={list.id}
            onClick={() => onSelectList(list.id)}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-0.5 transition-all duration-200 ${
              selectedListId === list.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
            }`}
          >
            {list.name}
          </button>
        ))}

        {!listsLoading && lists.length === 0 && selectedWsId && (
          <p className="text-xs text-gray-300 px-2 py-2">No lists yet.</p>
        )}
      </nav>
    </aside>
  );
}
