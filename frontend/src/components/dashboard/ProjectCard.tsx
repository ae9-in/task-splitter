import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Layers, CheckSquare, Trash2, ArrowRight } from 'lucide-react';
import type { ProjectSummary } from '../../types';
import StatusPill from '../ui/StatusPill';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatRelativeDate, truncate } from '../../utils/formatters';
import './ProjectCard.css';

interface ProjectCardProps {
  project: ProjectSummary;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function ProjectCard({ project, onDelete, isDeleting }: ProjectCardProps) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleOpen = () => navigate(`/projects/${project._id}`);

  return (
    <>
      <div className="project-card card fade-in" onClick={handleOpen} role="button" tabIndex={0}
           onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
           id={`project-card-${project._id}`}>
        <div className="project-card-header">
          <StatusPill status={project.status} size="sm" />
          <button
            className="project-card-delete"
            onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
            aria-label="Delete project"
            title="Delete project"
            id={`project-delete-${project._id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <h3 className="project-card-title">{project.title}</h3>

        {project.description && (
          <p className="project-card-desc">
            {truncate(project.description, 100)}
          </p>
        )}

        <div className="project-card-badges">
          <span className="project-card-badge">
            <Layers size={13} />
            {project.moduleCount} {project.moduleCount === 1 ? 'module' : 'modules'}
          </span>
          <span className="project-card-badge">
            <CheckSquare size={13} />
            {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <div className="project-card-footer">
          <span className="project-card-date">
            <Calendar size={12} />
            Updated {formatRelativeDate(project.updatedAt)}
          </span>
          <button className="project-card-open" onClick={handleOpen} id={`project-open-${project._id}`}>
            Open <ArrowRight size={13} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { onDelete(project._id); setShowConfirm(false); }}
        title="Delete Project"
        message={`Delete "${project.title}" and all its data? This cannot be undone.`}
        confirmLabel="Delete Project"
        isLoading={isDeleting}
      />
    </>
  );
}
