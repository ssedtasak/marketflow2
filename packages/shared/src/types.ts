export type Role = 'admin' | 'member' | 'viewer';
export type ViewKind = 'list' | 'board' | 'calendar';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
}

export interface Space {
  id: string;
  workspaceId: string;
  name: string;
  position: string;
}

export interface Folder {
  id: string;
  spaceId: string;
  name: string;
  position: string;
}

export interface List {
  id: string;
  folderId: string;
  name: string;
  position: string;
  defaultView: ViewKind;
}

export interface Task {
  id: string;
  listId: string;
  parentTaskId: string | null;
  title: string;
  status: string;
  priority: Priority | null;
  assigneeId: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  position: string;
}
