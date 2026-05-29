import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';
import type { Feature, Task } from '../../types';
import TaskRow from './TaskRow';
import { AddTaskForm } from './AddForms';
import InlineEdit from './InlineEdit';
import ConfirmDialog from '../ui/ConfirmDialog';
import { CountBadge } from '../ui/Badge';
import './FeatureCard.css';

interface FeatureCardProps {
  feature: Feature;
  moduleId: string;
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
  onDeleteFeature: (featureId: string) => void;
  onAddTask: (featureId: string, title: string, description: string) => void;
  onUpdateTask: (featureId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (featureId: string, taskId: string) => void;
  searchQuery?: string;
  filterPriority?: string;
  filterType?: string;
}

export default function FeatureCard({
  feature,
  moduleId,
  onUpdateFeature,
  onDeleteFeature,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  searchQuery,
  filterPriority,
  filterType,
}: FeatureCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const taskCount = feature.tasks.length;

  return (
    <>
      <div className="feature-card">
        <div className="feature-header">
          <button
            className="feature-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand feature' : 'Collapse feature'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
          </button>

          <div className="feature-title-area">
            <InlineEdit
              value={feature.name}
              onSave={(v) => onUpdateFeature(feature.id, { name: v })}
              placeholder="Feature name…"
              fontSize="0.9rem"
              fontWeight={600}
              color="var(--text-primary)"
            />
            {feature.description && (
              <InlineEdit
                value={feature.description}
                onSave={(v) => onUpdateFeature(feature.id, { description: v })}
                placeholder="Description…"
                fontSize="0.8rem"
                color="var(--text-muted)"
              />
            )}
          </div>

          <div className="feature-meta">
            <CountBadge count={taskCount} label={taskCount === 1 ? 'task' : 'tasks'} color="var(--teal-mid)" />
            <button
              className="feature-btn feature-btn-delete"
              onClick={() => setShowConfirm(true)}
              aria-label="Delete feature"
              title="Delete feature"
              id={`feature-delete-${feature.id}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="feature-body">
            {feature.tasks.length === 0 && !showAddTask && (
              <div className="feature-empty">
                <button className="add-placeholder" onClick={() => setShowAddTask(true)}>
                  <Plus size={14} /> Add first task…
                </button>
              </div>
            )}

            <div className="feature-tasks">
              {feature.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  moduleId={moduleId}
                  featureId={feature.id}
                  onUpdate={(taskId, updates) => onUpdateTask(feature.id, taskId, updates)}
                  onDelete={(taskId) => onDeleteTask(feature.id, taskId)}
                  searchQuery={searchQuery}
                  filterPriority={filterPriority}
                  filterType={filterType}
                />
              ))}
            </div>

            {showAddTask ? (
              <AddTaskForm
                onAdd={(title, desc) => {
                  onAddTask(feature.id, title, desc);
                  setShowAddTask(false);
                }}
                onCancel={() => setShowAddTask(false)}
              />
            ) : (
              feature.tasks.length > 0 && (
                <button
                  className="add-placeholder"
                  onClick={() => setShowAddTask(true)}
                  id={`add-task-${feature.id}`}
                >
                  <Plus size={13} /> Add task
                </button>
              )
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { onDeleteFeature(feature.id); setShowConfirm(false); }}
        title="Delete Feature"
        message={`Delete "${feature.name}" and all its ${taskCount} task(s)? This cannot be undone.`}
        confirmLabel="Delete Feature"
      />
    </>
  );
}
