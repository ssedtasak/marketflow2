import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useWorkspaces, useLists, useCreateWorkspace, useCreateList } from '@/hooks/useQueries';
import { useAuth } from '@/lib/auth-context';
export function Sidebar({ selectedListId, onSelectList, onSelectView, currentView, }) {
    const { user, logout } = useAuth();
    const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces();
    const [selectedWsId, setSelectedWsId] = useState(workspaces[0]?.id ?? null);
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
    const handleCreateWs = async (e) => {
        e.preventDefault();
        if (!newWsName.trim())
            return;
        try {
            const ws = await createWs.mutateAsync(newWsName.trim());
            setSelectedWsId(ws.id);
            setNewWsName('');
            setShowNewWs(false);
        }
        catch {
            // error handled by mutation
        }
    };
    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim() || !selectedWsId)
            return;
        try {
            await createList.mutateAsync({ workspaceId: selectedWsId, name: newListName.trim() });
            setNewListName('');
            setShowNewList(false);
        }
        catch {
            // error handled by mutation
        }
    };
    return (_jsxs("aside", { className: "w-60 min-h-screen bg-[#191919] flex flex-col text-white", children: [_jsxs("div", { className: "px-3 py-3 border-b border-white/10", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center", children: _jsxs("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M2 12L8 4L14 12", stroke: "white", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M5 12L8 7L11 12", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", opacity: "0.6" })] }) }), _jsx("h1", { className: "text-sm font-semibold text-white", children: "MarketFlow" })] }), _jsx("button", { onClick: logout, className: "text-white/40 hover:text-white/70 p-1", title: "Sign out", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }) })] }), user && (_jsx("p", { className: "text-[11px] text-white/50 mt-1 truncate", children: user.email }))] }), _jsxs("div", { className: "px-3 py-2 border-b border-white/10", children: [_jsxs("select", { value: selectedWsId ?? '', onChange: (e) => setSelectedWsId(e.target.value || null), className: "w-full text-sm bg-white/10 border border-white/10 rounded-md px-2 py-1.5 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/15", children: [wsLoading && _jsx("option", { className: "bg-[#191919]", children: "Loading..." }), workspaces.map((ws) => (_jsx("option", { value: ws.id, className: "bg-[#191919]", children: ws.name }, ws.id)))] }), showNewWs && (_jsxs("form", { onSubmit: handleCreateWs, className: "mt-2 flex gap-1", children: [_jsx("input", { autoFocus: true, value: newWsName, onChange: (e) => setNewWsName(e.target.value), placeholder: "Workspace name", className: "flex-1 text-xs bg-white/10 border border-white/10 rounded px-2 py-1 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20" }), _jsx("button", { type: "submit", className: "text-xs text-white/70 hover:text-white px-1", children: "Add" }), _jsx("button", { type: "button", onClick: () => setShowNewWs(false), className: "text-xs text-white/40 hover:text-white/70 px-1", children: "\u2715" })] })), !showNewWs && (_jsxs("button", { onClick: () => setShowNewWs(true), className: "mt-2 w-full text-xs text-white/40 hover:text-white/70 flex items-center gap-1 px-1", children: [_jsx("svg", { className: "h-3 w-3", width: "12", height: "12", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "New workspace"] }))] }), _jsxs("div", { className: "px-3 py-3 border-b border-white/10", children: [_jsx("p", { className: "text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2", children: "View" }), _jsxs("div", { className: "flex gap-1", children: [_jsxs("button", { onClick: () => onSelectView('calendar'), title: "Calendar", className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded transition-colors ${currentView === 'calendar'
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/50 hover:text-white/70 hover:bg-white/10'}`, children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("span", { className: "text-[10px]", children: "\uD83D\uDCC5 Calendar" })] }, "calendar"), _jsxs("button", { onClick: () => onSelectView('list'), title: "List", className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded transition-colors ${currentView === 'list'
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/50 hover:text-white/70 hover:bg-white/10'}`, children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), _jsx("span", { className: "text-[10px]", children: "\uD83D\uDCCB List" })] }, "list"), _jsxs("button", { onClick: () => onSelectView('kanban'), title: "Kanban", className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded transition-colors ${currentView === 'kanban'
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/50 hover:text-white/70 hover:bg-white/10'}`, children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5v6m-3-3h6m-3 9v2m-6-6h12M6 5v14" }) }), _jsx("span", { className: "text-[10px]", children: "\uD83D\uDCCC Kanban" })] }, "kanban")] })] }), _jsxs("nav", { className: "flex-1 overflow-y-auto px-3 py-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-[10px] font-medium text-white/30 uppercase tracking-wider", children: "Lists" }), _jsx("button", { onClick: () => setShowNewList(true), className: "text-white/30 hover:text-white/60 p-0.5", title: "New list", children: _jsx("svg", { className: "h-3.5 w-3.5", width: "14", height: "14", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) })] }), showNewList && (_jsxs("form", { onSubmit: handleCreateList, className: "mb-2 flex gap-1", children: [_jsx("input", { autoFocus: true, value: newListName, onChange: (e) => setNewListName(e.target.value), placeholder: "List name", className: "flex-1 text-xs bg-white/10 border border-white/10 rounded px-2 py-1 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20" }), _jsx("button", { type: "submit", className: "text-xs text-white/70 hover:text-white px-1", children: "Add" }), _jsx("button", { type: "button", onClick: () => setShowNewList(false), className: "text-xs text-white/40 hover:text-white/60 px-1", children: "\u2715" })] })), listsLoading && (_jsx("p", { className: "text-xs text-white/30 px-2 py-1", children: "Loading..." })), lists.map((list) => (_jsx("button", { onClick: () => onSelectList(list.id), className: `w-full text-left text-sm px-2 py-1.5 rounded-md my-0.5 transition-colors ${selectedListId === list.id
                            ? 'bg-white/15 text-white'
                            : 'text-white/60 hover:bg-white/10 hover:text-white/80'}`, children: list.name }, list.id))), !listsLoading && lists.length === 0 && selectedWsId && (_jsx("p", { className: "text-xs text-white/30 px-2 py-1", children: "No lists yet." }))] })] }));
}
