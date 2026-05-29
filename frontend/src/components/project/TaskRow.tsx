import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task, TaskPriority, TaskType } from '../../types';
import { PriorityBadge, TypeBadge } from '../ui/Badge';
import InlineEdit from './InlineEdit';
import ConfirmDialog from '../ui/ConfirmDialog';
import './TaskRow.css';

interface TaskRowProps {
  task: Task;
  moduleId: string;
  featureId: string;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  searchQuery?: string;
  filterPriority?: string;
  filterType?: string;
}

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const TYPES: TaskType[] = ['frontend', 'backend', 'database', 'devops', 'design', 'testing'];


export default function TaskRow({
  task,
  onUpdate,
  onDelete,
  searchQuery = '',
  filterPriority,
  filterType,
}: TaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Filter logic
  if (filterPriority && filterPriority !== 'all' && task.priority !== filterPriority) return null;
  if (filterType && filterType !== 'all' && task.type !== filterType) return null;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const matches =
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q);
    if (!matches) return null;
  }

  return (
    <>
      <div className={`task-row ${expanded ? 'task-row-expanded' : ''}`}>
        <div className="task-row-main">
          <div className="task-row-title">
            <InlineEdit
              value={task.title}
              onSave={(v) => onUpdate(task.id, { title: v })}
              placeholder="Task title…"
              fontSize="0.9rem"
              fontWeight={500}
            />
          </div>

          <div className="task-row-meta">
            {/* Priority dropdown */}
            <select
              className="task-select"
              value={task.priority}
              onChange={(e) => onUpdate(task.id, { priority: e.target.value as TaskPriority })}
              aria-label="Task priority"
              id={`task-priority-${task.id}`}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <PriorityBadge priority={task.priority} />

            {/* Type dropdown */}
            <select
              className="task-select"
              value={task.type}
              onChange={(e) => onUpdate(task.id, { type: e.target.value as TaskType })}
              aria-label="Task type"
              id={`task-type-${task.id}`}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <TypeBadge type={task.type} />

            <button
              className="task-btn"
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? 'Collapse description' : 'Expand description'}
              title={expanded ? 'Collapse' : 'Show description'}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              className="task-btn task-btn-delete"
              onClick={() => setShowConfirm(true)}
              aria-label="Delete task"
              title="Delete task"
              id={`task-delete-${task.id}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="task-row-description fade-in">
            <InlineEdit
              value={task.description}
              onSave={(v) => onUpdate(task.id, { description: v })}
              placeholder="Add a description…"
              multiline
              fontSize="0.875rem"
              color="var(--text-muted)"
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { onDelete(task.id); setShowConfirm(false); }}
        title="Delete Task"
        message="Are you sure you want to delete this task? This cannot be undone."
        confirmLabel="Delete Task"
      />
    </>
  );
}
