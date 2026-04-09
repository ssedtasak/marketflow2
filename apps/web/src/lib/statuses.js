// ─── Custom Status Management (localStorage) ────────────────────────────────
const STORAGE_KEY = 'marketflow-custom-statuses';
const DEFAULT_STATUSES = [
    { id: 'todo', label: 'To Do', isDefault: true },
    { id: 'in_review', label: 'In Review', isDefault: true },
    { id: 'approved', label: 'Approved', isDefault: true },
    { id: 'done', label: 'Done', isDefault: true },
];
function getCustomStatuses() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
function saveCustomStatuses(statuses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}
export function getAllStatuses() {
    return [...DEFAULT_STATUSES, ...getCustomStatuses()];
}
export function addCustomStatus(id, label) {
    const all = getAllStatuses();
    if (all.find((s) => s.id === id)) {
        throw new Error(`Status "${id}" already exists`);
    }
    const newStatus = { id, label, isDefault: false };
    const customs = getCustomStatuses();
    customs.push(newStatus);
    saveCustomStatuses(customs);
    return newStatus;
}
export function removeCustomStatus(id) {
    const defaults = DEFAULT_STATUSES.map((s) => s.id);
    if (defaults.includes(id)) {
        throw new Error('Cannot remove default statuses');
    }
    const customs = getCustomStatuses().filter((s) => s.id !== id);
    saveCustomStatuses(customs);
}
export function getStatusLabel(id) {
    const all = getAllStatuses();
    return all.find((s) => s.id === id)?.label ?? id;
}
export function isDefaultStatus(id) {
    return DEFAULT_STATUSES.some((s) => s.id === id);
}
