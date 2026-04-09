import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useWorkspaces, useLists, useCreateWorkspace, useCreateList, useDeleteList } from '@/hooks/useQueries';
import { useAuth } from '@/lib/auth-context';
import { getAllStatuses, addCustomStatus, removeCustomStatus } from '@/lib/statuses';
function StatusManager({ onClose }) {
    const [statuses, setStatuses] = useState(getAllStatuses());
    const [newId, setNewId] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [error, setError] = useState('');
    const refresh = () => setStatuses(getAllStatuses());
    const handleAdd = (e) => {
        e.preventDefault();
        setError('');
        if (!newId.trim() || !newLabel.trim())
            return;
        try {
            addCustomStatus(newId.trim().replace(/\s+/g, '_').toLowerCase(), newLabel.trim());
            setNewId('');
            setNewLabel('');
            refresh();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add status');
        }
    };
    const handleRemove = (id) => {
        try {
            removeCustomStatus(id);
            refresh();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove status');
        }
    };
    return (_jsxs("div", { className: "absolute left-0 top-0 w-56 min-h-screen bg-gray-50/80 border-r border-gray-100/80 z-50 flex flex-col", children: [_jsxs("div", { className: "px-4 py-4 border-b border-gray-100/60 flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-semibold text-gray-900", children: "Manage Statuses" }), _jsx("button", { type: "button", onClick: onClose, className: "text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-3 py-3 space-y-1.5", children: statuses.map((s) => (_jsxs("div", { className: "flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-100/60", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-700", children: s.label }), _jsx("p", { className: "text-[10px] text-gray-400", children: s.id })] }), !s.isDefault && (_jsx("button", { type: "button", onClick: () => handleRemove(s.id), className: "text-gray-300 hover:text-red-500 p-1 rounded transition-colors duration-200", title: "Remove status", children: _jsx("svg", { className: "h-3.5 w-3.5", width: "14", height: "14", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }, s.id))) }), _jsxs("div", { className: "px-3 py-3 border-t border-gray-100/60", children: [error && (_jsx("p", { className: "text-[10px] text-red-500 mb-2 px-1", children: error })), _jsxs("form", { onSubmit: handleAdd, className: "space-y-2", children: [_jsx("input", { value: newLabel, onChange: (e) => setNewLabel(e.target.value), placeholder: "Status label", className: "w-full text-xs bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200" }), _jsx("input", { value: newId, onChange: (e) => setNewId(e.target.value), placeholder: "ID (auto-generated if blank)", className: "w-full text-xs bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200" }), _jsx("button", { type: "submit", className: "w-full px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]", children: "Add Status" })] })] })] }));
}
export function Sidebar({ selectedListId, onSelectList, onSelectView, currentView, }) {
    const { user, logout } = useAuth();
    const { data: workspaces = [], isLoading: wsLoading } = useWorkspaces();
    const [selectedWsId, setSelectedWsId] = useState(workspaces[0]?.id ?? null);
    const { data: lists = [], isLoading: listsLoading } = useLists(selectedWsId ?? '');
    const deleteList = useDeleteList();
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
    const [showStatusManager, setShowStatusManager] = useState(false);
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
    const handleDeleteList = async (listId, listName) => {
        if (!selectedWsId)
            return;
        if (!confirm(`Delete list "${listName}"? All tasks in this list will be permanently deleted.`))
            return;
        try {
            await deleteList.mutateAsync({ id: listId, workspaceId: selectedWsId });
            if (selectedListId === listId) {
                onSelectList(''); // Clear selection — parent should handle null
            }
        }
        catch {
            // error handled by mutation
        }
    };
    return (_jsxs(_Fragment, { children: [showStatusManager && _jsx(StatusManager, { onClose: () => setShowStatusManager(false) }), _jsxs("aside", { className: "w-56 min-h-screen bg-gray-50/80 border-r border-gray-100/80 flex flex-col", children: [_jsx("div", { className: "px-4 py-4 border-b border-gray-100/60", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm", children: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M2 12L8 4L14 12", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M5 12L8 7L11 12", stroke: "white", strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round", opacity: "0.6" })] }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-sm font-semibold text-gray-900 tracking-tight", children: "MarketFlow" }), user && (_jsx("p", { className: "text-[10px] text-gray-400 truncate max-w-28", children: user.email }))] })] }), _jsx("button", { onClick: logout, className: "text-gray-300 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200", title: "Sign out", children: _jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }) })] }) }), _jsxs("div", { className: "px-3 py-3 border-b border-gray-100/60", children: [_jsxs("select", { value: selectedWsId ?? '', onChange: (e) => setSelectedWsId(e.target.value || null), className: "w-full text-sm bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200 cursor-pointer", children: [wsLoading && _jsx("option", { className: "bg-white", children: "Loading..." }), workspaces.map((ws) => (_jsx("option", { value: ws.id, className: "bg-white", children: ws.name }, ws.id)))] }), showNewWs && (_jsxs("form", { onSubmit: handleCreateWs, className: "mt-2.5 flex gap-1.5", children: [_jsx("input", { autoFocus: true, value: newWsName, onChange: (e) => setNewWsName(e.target.value), placeholder: "Workspace name", className: "flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200" }), _jsx("button", { type: "submit", className: "px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]", children: "Add" }), _jsx("button", { type: "button", onClick: () => setShowNewWs(false), className: "px-2 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200", children: "\u2715" })] })), !showNewWs && (_jsxs("button", { type: "button", onClick: () => setShowNewWs(true), className: "mt-2.5 w-full text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200", children: [_jsx("svg", { className: "h-3.5 w-3.5", width: "12", height: "12", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "New workspace"] }))] }), _jsxs("div", { className: "px-3 py-3 border-b border-gray-100/60", children: [_jsx("p", { className: "text-[10px] font-medium text-gray-300 uppercase tracking-wider mb-2 px-2", children: "View" }), _jsxs("div", { className: "flex gap-1 bg-gray-100/60 rounded-xl p-1", children: [_jsxs("button", { type: "button", onClick: () => onSelectView('calendar'), title: "Calendar", className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all duration-200 ${currentView === 'calendar'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`, children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("span", { className: "text-[10px] font-medium", children: "Calendar" })] }, "calendar"), _jsxs("button", { type: "button", onClick: () => onSelectView('list'), title: "List", className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all duration-200 ${currentView === 'list'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`, children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), _jsx("span", { className: "text-[10px] font-medium", children: "List" })] }, "list"), _jsxs("button", { type: "button", onClick: () => onSelectView('kanban'), title: "Kanban", className: `flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all duration-200 ${currentView === 'kanban'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`, children: [_jsx("svg", { className: "h-4 w-4", width: "16", height: "16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5v6m-3-3h6m-3 9v2m-6-6h12M6 5v14" }) }), _jsx("span", { className: "text-[10px] font-medium", children: "Board" })] }, "kanban")] })] }), _jsxs("nav", { className: "flex-1 overflow-y-auto px-3 py-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-2 px-2", children: [_jsx("span", { className: "text-[10px] font-medium text-gray-300 uppercase tracking-wider", children: "Lists" }), _jsx("button", { type: "button", onClick: () => setShowNewList(true), className: "text-gray-300 hover:text-gray-500 p-1 rounded-md hover:bg-gray-100/80 transition-all duration-200", title: "New list", children: _jsx("svg", { className: "h-3.5 w-3.5", width: "14", height: "14", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) })] }), showNewList && (_jsxs("form", { onSubmit: handleCreateList, className: "mb-2.5 flex gap-1.5", children: [_jsx("input", { autoFocus: true, value: newListName, onChange: (e) => setNewListName(e.target.value), placeholder: "List name", className: "flex-1 text-xs bg-white border border-gray-200/60 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all duration-200" }), _jsx("button", { type: "submit", className: "px-3 py-2 text-xs text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]", children: "Add" }), _jsx("button", { type: "button", onClick: () => setShowNewList(false), className: "px-2 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200", children: "\u2715" })] })), listsLoading && (_jsx("p", { className: "text-xs text-gray-300 px-2 py-2", children: "Loading..." })), lists.map((list) => (_jsxs("div", { className: `group flex items-center rounded-lg mb-0.5 transition-all duration-200 ${selectedListId === list.id
                                    ? 'bg-white shadow-sm'
                                    : 'hover:bg-white/60'}`, children: [_jsx("button", { type: "button", onClick: () => onSelectList(list.id), className: `flex-1 text-left text-sm px-3 py-2 transition-all duration-200 ${selectedListId === list.id
                                            ? 'text-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'}`, children: list.name }), _jsx("button", { type: "button", onClick: () => handleDeleteList(list.id, list.name), className: "text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded-md hover:bg-red-50 transition-all duration-200", title: "Delete list", children: _jsx("svg", { className: "h-3.5 w-3.5", width: "14", height: "14", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, list.id))), !listsLoading && lists.length === 0 && selectedWsId && (_jsx("p", { className: "text-xs text-gray-300 px-2 py-2", children: "No lists yet." }))] }), _jsx("div", { className: "px-3 py-2 border-t border-gray-100/60", children: _jsxs("button", { type: "button", onClick: () => setShowStatusManager(true), className: "w-full text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200", children: [_jsx("svg", { className: "h-3.5 w-3.5", width: "14", height: "14", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" }) }), "Manage Statuses"] }) })] })] }));
}
