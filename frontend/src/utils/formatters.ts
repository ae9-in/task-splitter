import type { TaskPriority, TaskType } from '../types';

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text;
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high:   '#e74c3c',
  medium: '#e67e22',
  low:    '#27ae60',
};

export const PRIORITY_BG: Record<TaskPriority, string> = {
  high:   '#fdecea',
  medium: '#fef5e7',
  low:    '#eafaf1',
};

export const TYPE_COLORS: Record<TaskType, string> = {
  frontend:  '#8e44ad',
  backend:   '#2980b9',
  database:  '#16a085',
  devops:    '#d35400',
  design:    '#c0392b',
  testing:   '#27ae60',
};

export const TYPE_BG: Record<TaskType, string> = {
  frontend:  '#f4ecfa',
  backend:   '#eaf3fb',
  database:  '#e8f8f5',
  devops:    '#fef0e6',
  design:    '#fdedeb',
  testing:   '#eafaf1',
};

export const MODULE_ACCENT_COLORS = [
  '#007979', '#8e44ad', '#2980b9',
  '#e67e22', '#27ae60', '#c0392b',
  '#16a085', '#d35400',
];

export function getModuleAccentColor(index: number): string {
  return MODULE_ACCENT_COLORS[index % MODULE_ACCENT_COLORS.length];
}
