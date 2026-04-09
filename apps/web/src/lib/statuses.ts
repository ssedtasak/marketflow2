// ─── Custom Status Management (localStorage) ────────────────────────────────

const STORAGE_KEY = 'marketflow-custom-statuses';

export interface StatusConfig {
  id: string;
  label: string;
  isDefault: boolean;
}

const DEFAULT_STATUSES: StatusConfig[] = [
  { id: 'todo', label: 'To Do', isDefault: true },
  { id: 'in_review', label: 'In Review', isDefault: true },
  { id: 'approved', label: 'Approved', isDefault: true },
  { id: 'done', label: 'Done', isDefault: true },
];

function getCustomStatuses(): StatusConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StatusConfig[];
  } catch {
    return [];
  }
}

function saveCustomStatuses(statuses: StatusConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}

export function getAllStatuses(): StatusConfig[] {
  return [...DEFAULT_STATUSES, ...getCustomStatuses()];
}

export function addCustomStatus(id: string, label: string): StatusConfig {
  const all = getAllStatuses();
  if (all.find((s) => s.id === id)) {
    throw new Error(`Status "${id}" already exists`);
  }
  const newStatus: StatusConfig = { id, label, isDefault: false };
  const customs = getCustomStatuses();
  customs.push(newStatus);
  saveCustomStatuses(customs);
  return newStatus;
}

export function removeCustomStatus(id: string): void {
  const defaults = DEFAULT_STATUSES.map((s) => s.id);
  if (defaults.includes(id)) {
    throw new Error('Cannot remove default statuses');
  }
  const customs = getCustomStatuses().filter((s) => s.id !== id);
  saveCustomStatuses(customs);
}

export function getStatusLabel(id: string): string {
  const all = getAllStatuses();
  return all.find((s) => s.id === id)?.label ?? id;
}

export function isDefaultStatus(id: string): boolean {
  return DEFAULT_STATUSES.some((s) => s.id === id);
}
