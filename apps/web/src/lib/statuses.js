// ─── Custom Status Management (localStorage) ────────────────────────────────
import { useSyncExternalStore } from 'react';
const STORAGE_KEY = 'marketflow-custom-statuses';
const COLUMN_ORDER_KEY = 'marketflow-column-order';
const DEFAULT_STATUSES = [
    { id: 'todo', label: 'To Do', isDefault: true },
    { id: 'in_review', label: 'In Review', isDefault: true },
    { id: 'approved', label: 'Approved', isDefault: true },
    { id: 'done', label: 'Done', isDefault: true },
];
const listeners = new Set();
function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
function notify() {
    listeners.forEach((l) => l());
}
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
    notify();
}
export function getAllStatuses() {
    return [...DEFAULT_STATUSES, ...getCustomStatuses()];
}
/**
 * React hook that returns all statuses and re-renders when they change.
 */
export function useAllStatuses() {
    return useSyncExternalStore(subscribe, getAllStatuses);
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
// ─── Column Order Management ─────────────────────────────────────────────────
export function getColumnOrder() {
    try {
        const raw = localStorage.getItem(COLUMN_ORDER_KEY);
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function saveColumnOrder(order) {
    localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order));
    notify();
}
/**
 * Return statuses ordered by saved column order.
 * Any statuses not in the saved order are appended at the end.
 */
export function getOrderedStatuses() {
    const all = getAllStatuses();
    const order = getColumnOrder();
    if (!order)
        return all;
    const ordered = [];
    const seen = new Set();
    // Add statuses in saved order
    for (const id of order) {
        const status = all.find((s) => s.id === id);
        if (status) {
            ordered.push(status);
            seen.add(id);
        }
    }
    // Append any statuses not in saved order
    for (const status of all) {
        if (!seen.has(status.id)) {
            ordered.push(status);
        }
    }
    return ordered;
}
/**
 * React hook that returns ordered statuses and re-renders on change.
 */
export function useOrderedStatuses() {
    return useSyncExternalStore(subscribe, getOrderedStatuses);
}
