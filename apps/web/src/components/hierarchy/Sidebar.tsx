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
    <aside className="w-60 min-h-screen bg-[#191919] flex flex-col text-white">
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12L8 4L14 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12L8 7L11 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              </svg>
            </div>
            <h1 className="text-sm font-semibold text-white">MarketFlow</h1>
          </div>
          <button
            onClick={logout}
            className="text-white/40 hover:text-white/70 p-1"
            title="Sign out"
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        {user && (
          <p className="text-[11px] text-white/50 mt-1 truncate">{user.email}</p>
        )}
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-2 border-b border-white/10">
        <select
          value={selectedWsId ?? ''}
          onChange={(e) => setSelectedWsId(e.target.value || null)}
          className="w-full text-sm bg-white/10 border border-white/10 rounded-md px-2 py-1.5 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/15"
        >
          {wsLoading && <option className="bg-[#191919]">Loading...</option>}
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id} className="bg-[#191919]">
              {ws.name}
            </option>
          ))}
        </select>
        {showNewWs && (
          <form onSubmit={handleCreateWs} className="mt-2 flex gap-1">
            <input
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="Workspace name"
              className="flex-1 text-xs bg-white/10 border border-white/10 rounded px-2 py-1 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <button type="submit" className="text-xs text-white/70 hover:text-white px-1">
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewWs(false)}
              className="text-xs text-white/40 hover:text-white/70 px-1"
            >
              ✕
            </button>
          </form>
        )}
        {!showNewWs && (
          <button
            onClick={() => setShowNewWs(true)}
            className="mt-2 w-full text-xs text-white/40 hover:text-white/70 flex items-center gap-1 px-1"
          >
            <svg className="h-3 w-3" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New workspace
          </button>
        )}
      </div>

      {/* View switcher */}
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2">View</p>
        <div className="flex gap-1">
          <button
            key="calendar"
            onClick={() => onSelectView('calendar')}
            title="Calendar"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded transition-colors ${
              currentView === 'calendar'
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white/70 hover:bg-white/10'
            }`}
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px]">📅 Calendar</span>
          </button>
          <button
            key="list"
            onClick={() => onSelectView('list')}
            title="List"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded transition-colors ${
              currentView === 'list'
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white/70 hover:bg-white/10'
            }`}
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-[10px]">📋 List</span>
          </button>
          <button
            key="kanban"
            onClick={() => onSelectView('kanban')}
            title="Kanban"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded transition-colors ${
              currentView === 'kanban'
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white/70 hover:bg-white/10'
            }`}
          >
            <svg className="h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5v6m-3-3h6m-3 9v2m-6-6h12M6 5v14" />
            </svg>
            <span className="text-[10px]">📌 Kanban</span>
          </button>
        </div>
      </div>

      {/* Lists */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
            Lists
          </span>
          <button
            onClick={() => setShowNewList(true)}
            className="text-white/30 hover:text-white/60 p-0.5"
            title="New list"
          >
            <svg className="h-3.5 w-3.5" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {showNewList && (
          <form onSubmit={handleCreateList} className="mb-2 flex gap-1">
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
              className="flex-1 text-xs bg-white/10 border border-white/10 rounded px-2 py-1 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <button type="submit" className="text-xs text-white/70 hover:text-white px-1">
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewList(false)}
              className="text-xs text-white/40 hover:text-white/60 px-1"
            >
              ✕
            </button>
          </form>
        )}

        {listsLoading && (
          <p className="text-xs text-white/30 px-2 py-1">Loading...</p>
        )}

        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => onSelectList(list.id)}
            className={`w-full text-left text-sm px-2 py-1.5 rounded-md my-0.5 transition-colors ${
              selectedListId === list.id
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {list.name}
          </button>
        ))}

        {!listsLoading && lists.length === 0 && selectedWsId && (
          <p className="text-xs text-white/30 px-2 py-1">No lists yet.</p>
        )}
      </nav>
    </aside>
  );
}
