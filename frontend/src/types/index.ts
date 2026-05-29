export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'testing';
  order: number;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  order: number;
  tasks: Task[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  order: number;
  features: Feature[];
}

export type ProjectStatus = 'draft' | 'in-progress' | 'complete';

export interface Project {
  _id: string;
  title: string;
  description: string;
  requirementText: string;
  status: ProjectStatus;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  moduleCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type ExportFormat = 'json' | 'markdown' | 'csv';

export type TaskType = Task['type'];
export type TaskPriority = Task['priority'];
