import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, Plus, Search } from 'lucide-react';
import { getProject, splitProject, updateProject } from '../api/projects';
import type { Project, ProjectStatus, Module, Feature, Task } from '../types';
import { useProjectContext, ProjectProvider } from '../context/ProjectContext';
import { useAutosave } from '../hooks/useAutosave';
import PageWrapper from '../components/layout/PageWrapper';
import ModuleCard from '../components/project/ModuleCard';
import { AddModuleForm } from '../components/project/AddForms';
import InlineEdit from '../components/project/InlineEdit';
import StatusPill from '../components/ui/StatusPill';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExportMenu from '../components/ui/ExportMenu';
import toast from 'react-hot-toast';
import './ProjectDetailPage.css';

// ─── Inner component (needs context) ─────────────────────────────────────────
function ProjectDetailInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, dispatch } = useProjectContext();

  const [showAddModule, setShowAddModule] = useState(false);
  const [showReanalyseConfirm, setShowReanalyseConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Fetch project
  const { data: fetchedProject, isLoading, isError } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
    staleTime: 0,
  });

  // Sync fetched data into context
  useEffect(() => {
    if (fetchedProject) {
      dispatch({ type: 'SET_PROJECT', payload: fetchedProject });
    }
  }, [fetchedProject, dispatch]);

  // Autosave hook
  useAutosave(id);

  // Re-analyse mutation
  const reanalyseMutation = useMutation({
    mutationFn: () => splitProject(id!),
    onSuccess: (updated: Project) => {
      dispatch({ type: 'SET_PROJECT', payload: updated });
      toast.success('Requirements re-analysed successfully');
      setShowReanalyseConfirm(false);
    },
    onError: () => {
      toast.error('Re-analysis failed. Please try again.');
      setShowReanalyseConfirm(false);
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: (status: ProjectStatus) => updateProject(id!, { status }),
    onSuccess: (updated: Project) => {
      dispatch({ type: 'SET_PROJECT', payload: updated });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  // ─── Event handlers ───────────────────────────────────────────────────────
  const handleUpdateModule = (moduleId: string, updates: Partial<Module>) =>
    dispatch({ type: 'UPDATE_MODULE', payload: { moduleId, updates } });

  const handleDeleteModule = (moduleId: string) =>
    dispatch({ type: 'DELETE_MODULE', payload: { moduleId } });

  const handleAddModule = (name: string, description: string) => {
    dispatch({ type: 'ADD_MODULE', payload: { name, description } });
    setShowAddModule(false);
  };

  const handleAddFeature = (moduleId: string, name: string, description: string) =>
    dispatch({ type: 'ADD_FEATURE', payload: { moduleId, name, description } });

  const handleUpdateFeature = (moduleId: string, featureId: string, updates: Partial<Feature>) =>
    dispatch({ type: 'UPDATE_FEATURE', payload: { moduleId, featureId, updates } });

  const handleDeleteFeature = (moduleId: string, featureId: string) =>
    dispatch({ type: 'DELETE_FEATURE', payload: { moduleId, featureId } });

  const handleAddTask = (moduleId: string, featureId: string, title: string, description: string) =>
    dispatch({ type: 'ADD_TASK', payload: { moduleId, featureId, title, description } });

  const handleUpdateTask = (moduleId: string, featureId: string, taskId: string, updates: Partial<Task>) =>
    dispatch({ type: 'UPDATE_TASK', payload: { moduleId, featureId, taskId, updates } });

  const handleDeleteTask = (moduleId: string, featureId: string, taskId: string) =>
    dispatch({ type: 'DELETE_TASK', payload: { moduleId, featureId, taskId } });

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="detail-skeleton">
          <div className="skeleton" style={{ height: 40, width: '50%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, width: '30%', marginBottom: 32 }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 16, width: '70%' }} />
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError || !project) {
    return (
      <PageWrapper>
        <div className="detail-error">
          <p>Project not found or failed to load.</p>
          <Button variant="outline" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
            Back to Dashboard
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const totalTasks = project.modules.reduce(
    (s, m) => s + m.features.reduce((fs, f) => fs + f.tasks.length, 0),
    0
  );

  const STATUS_OPTIONS: ProjectStatus[] = ['draft', 'in-progress', 'complete'];

  return (
    <PageWrapper>
      {/* ─── Project Header ─────────────────────────────────────────────── */}
      <div className="detail-header">
        <div className="detail-header-top">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate('/')}
          >
            Dashboard
          </Button>

          <div className="detail-header-actions">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={() => setShowReanalyseConfirm(true)}
              id="reanalyse-btn"
            >
              Re-analyse
            </Button>
            <ExportMenu projectId={project._id} projectTitle={project.title} />
          </div>
        </div>

        <div className="detail-title-row">
          <div className="detail-title-block">
            <InlineEdit
              value={project.title}
              onSave={(v) => dispatch({ type: 'UPDATE_PROJECT_META', payload: { title: v } })}
              placeholder="Project title…"
              fontSize="1.75rem"
              fontWeight={700}
            />
            <InlineEdit
              value={project.description}
              onSave={(v) => dispatch({ type: 'UPDATE_PROJECT_META', payload: { description: v } })}
              placeholder="Add a description…"
              fontSize="0.9375rem"
              color="var(--text-muted)"
            />
          </div>

          <div className="detail-meta">
            {/* Status selector */}
            <div className="status-selector">
              <div className="status-trigger" onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}>
                <StatusPill status={project.status} />
                <span className="status-chevron">▾</span>
              </div>
              {statusDropdownOpen && (
                <div className="status-dropdown fade-in">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      className={`status-option ${project.status === s ? 'status-option-active' : ''}`}
                      onClick={() => {
                        statusMutation.mutate(s);
                        setStatusDropdownOpen(false);
                      }}
                      id={`status-${s}`}
                    >
                      <StatusPill status={s} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-stats">
              <span>{project.modules.length} modules</span>
              <span>·</span>
              <span>{totalTasks} tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Task Filters ────────────────────────────────────────────────── */}
      {project.modules.length > 0 && (
        <div className="detail-filters">
          <div className="detail-search-wrapper">
            <Search size={14} className="detail-search-icon" />
            <input
              type="search"
              className="detail-search-input"
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="task-search"
            />
          </div>

          <div className="detail-filter-group">
            <select
              className="detail-filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              id="filter-priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="detail-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              id="filter-type"
            >
              <option value="all">All Types</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="database">Database</option>
              <option value="devops">DevOps</option>
              <option value="design">Design</option>
              <option value="testing">Testing</option>
            </select>
          </div>
        </div>
      )}

      {/* ─── Module List ─────────────────────────────────────────────────── */}
      <div className="detail-modules">
        {project.modules.length === 0 && !showAddModule && (
          <div className="detail-empty">
            <p>No modules yet. Start by adding a module or re-analysing your requirements.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <Button variant="outline" onClick={() => setShowAddModule(true)}>
                <Plus size={14} /> Add Module
              </Button>
              <Button
                variant="primary"
                icon={<RefreshCw size={14} />}
                onClick={() => setShowReanalyseConfirm(true)}
              >
                Re-analyse
              </Button>
            </div>
          </div>
        )}

        {project.modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            index={index}
            onUpdateModule={handleUpdateModule}
            onDeleteModule={handleDeleteModule}
            onAddFeature={handleAddFeature}
            onUpdateFeature={handleUpdateFeature}
            onDeleteFeature={handleDeleteFeature}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            searchQuery={searchQuery}
            filterPriority={filterPriority}
            filterType={filterType}
          />
        ))}

        {showAddModule ? (
          <AddModuleForm
            onAdd={handleAddModule}
            onCancel={() => setShowAddModule(false)}
          />
        ) : (
          project.modules.length > 0 && (
            <button
              className="add-module-btn"
              onClick={() => setShowAddModule(true)}
              id="add-module-btn"
            >
              <Plus size={15} /> Add Module
            </button>
          )
        )}
      </div>

      {/* ─── Re-analyse Confirm ──────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showReanalyseConfirm}
        onClose={() => setShowReanalyseConfirm(false)}
        onConfirm={() => reanalyseMutation.mutate()}
        title="Re-analyse Requirements"
        message="This will replace all your current edits with a new AI breakdown. This cannot be undone. Are you sure?"
        confirmLabel="Re-analyse"
        isLoading={reanalyseMutation.isPending}
        variant="warning"
      />
    </PageWrapper>
  );
}

// ─── Outer wrapper with ProjectProvider ──────────────────────────────────────
export default function ProjectDetailPage() {
  return (
    <ProjectProvider>
      <ProjectDetailInner />
    </ProjectProvider>
  );
}
