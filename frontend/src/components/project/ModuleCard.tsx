import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';
import type { Module, Feature, Task } from '../../types';
import FeatureCard from './FeatureCard';
import { AddFeatureForm } from './AddForms';
import InlineEdit from './InlineEdit';
import ConfirmDialog from '../ui/ConfirmDialog';
import { CountBadge } from '../ui/Badge';
import { getModuleAccentColor } from '../../utils/formatters';
import './ModuleCard.css';

interface ModuleCardProps {
  module: Module;
  index: number;
  onUpdateModule: (moduleId: string, updates: Partial<Module>) => void;
  onDeleteModule: (moduleId: string) => void;
  onAddFeature: (moduleId: string, name: string, description: string) => void;
  onUpdateFeature: (moduleId: string, featureId: string, updates: Partial<Feature>) => void;
  onDeleteFeature: (moduleId: string, featureId: string) => void;
  onAddTask: (moduleId: string, featureId: string, title: string, description: string) => void;
  onUpdateTask: (moduleId: string, featureId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (moduleId: string, featureId: string, taskId: string) => void;
  searchQuery?: string;
  filterPriority?: string;
  filterType?: string;
}

export default function ModuleCard({
  module,
  index,
  onUpdateModule,
  onDeleteModule,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  searchQuery,
  filterPriority,
  filterType,
}: ModuleCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const accentColor = getModuleAccentColor(index);
  const featureCount = module.features.length;
  const taskCount = module.features.reduce((sum, f) => sum + f.tasks.length, 0);

  return (
    <>
      <div
        className="module-card card"
        style={{ borderLeftColor: accentColor }}
      >
        {/* Module Header */}
        <div className="module-header">
          <button
            className="module-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand module' : 'Collapse module'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>

          <div className="module-title-area">
            <div className="module-label" style={{ color: accentColor }}>
              MODULE {index + 1}
            </div>
            <InlineEdit
              value={module.name}
              onSave={(v) => onUpdateModule(module.id, { name: v })}
              placeholder="Module name…"
              fontSize="1.05rem"
              fontWeight={700}
            />
            {!collapsed && module.description && (
              <InlineEdit
                value={module.description}
                onSave={(v) => onUpdateModule(module.id, { description: v })}
                placeholder="Module description…"
                fontSize="0.875rem"
                color="var(--text-muted)"
              />
            )}
          </div>

          <div className="module-meta">
            <CountBadge count={featureCount} label={featureCount === 1 ? 'feature' : 'features'} color={accentColor} />
            <CountBadge count={taskCount} label={taskCount === 1 ? 'task' : 'tasks'} />
            <button
              className="module-btn module-btn-delete"
              onClick={() => setShowConfirm(true)}
              aria-label="Delete module"
              title="Delete module"
              id={`module-delete-${module.id}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Module Body */}
        {!collapsed && (
          <div className="module-body">
            {module.features.length === 0 && !showAddFeature ? (
              <div className="module-empty">
                <button className="add-placeholder-module" onClick={() => setShowAddFeature(true)}>
                  <Plus size={14} /> Add first feature…
                </button>
              </div>
            ) : (
              <div className="module-features">
                {module.features.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    moduleId={module.id}
                    onUpdateFeature={(fId, updates) => onUpdateFeature(module.id, fId, updates)}
                    onDeleteFeature={(fId) => onDeleteFeature(module.id, fId)}
                    onAddTask={(fId, title, desc) => onAddTask(module.id, fId, title, desc)}
                    onUpdateTask={(fId, tId, updates) => onUpdateTask(module.id, fId, tId, updates)}
                    onDeleteTask={(fId, tId) => onDeleteTask(module.id, fId, tId)}
                    searchQuery={searchQuery}
                    filterPriority={filterPriority}
                    filterType={filterType}
                  />
                ))}
              </div>
            )}

            {showAddFeature ? (
              <AddFeatureForm
                onAdd={(name, desc) => {
                  onAddFeature(module.id, name, desc);
                  setShowAddFeature(false);
                }}
                onCancel={() => setShowAddFeature(false)}
              />
            ) : (
              module.features.length > 0 && (
                <button
                  className="add-placeholder-module"
                  onClick={() => setShowAddFeature(true)}
                  id={`add-feature-${module.id}`}
                >
                  <Plus size={13} /> Add feature
                </button>
              )
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { onDeleteModule(module.id); setShowConfirm(false); }}
        title="Delete Module"
        message={`Delete "${module.name}" with ${featureCount} feature(s) and ${taskCount} task(s)? This cannot be undone.`}
        confirmLabel="Delete Module"
      />
    </>
  );
}
