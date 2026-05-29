import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { listProjects, deleteProject } from '../api/projects';
import type { ProjectSummary, ProjectStatus } from '../types';
import PageWrapper from '../components/layout/PageWrapper';
import ProjectCard from '../components/dashboard/ProjectCard';
import EmptyState from '../components/dashboard/EmptyState';
import SearchFilterBar from '../components/dashboard/SearchFilterBar';
import Button from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import './DashboardPage.css';

type FilterStatus = 'all' | ProjectStatus;

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 20, width: '60%' }} />
      <div className="skeleton" style={{ height: 14, width: '90%' }} />
      <div className="skeleton" style={{ height: 14, width: '75%' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 22, width: 80 }} />
        <div className="skeleton" style={{ height: 22, width: 70 }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const debouncedSearch = useDebounce(searchQuery, 200);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: projects = [], isLoading, isError } = useQuery<ProjectSummary[]>({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      setDeletingId(null);
    },
    onError: () => {
      toast.error('Failed to delete project');
      setDeletingId(null);
    },
  });

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch =
      !debouncedSearch ||
      p.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <PageWrapper>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Your Projects</h1>
          <p className="dashboard-subtitle">
            {projects.length > 0
              ? `${projects.length} project${projects.length !== 1 ? 's' : ''} · ${projects.reduce((s, p) => s + (p.taskCount || 0), 0)} total tasks`
              : 'Start by creating your first project'}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={17} />}
          onClick={() => navigate('/projects/new')}
          id="new-project-btn"
        >
          New Project
        </Button>
      </div>

      {!isLoading && projects.length > 0 && (
        <div className="dashboard-search-row">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      )}

      {isError && (
        <div className="dashboard-error">
          Failed to load projects. Please refresh.
        </div>
      )}

      {isLoading ? (
        <div className="dashboard-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 && projects.length === 0 ? (
        <EmptyState />
      ) : filteredProjects.length === 0 ? (
        <div className="dashboard-no-results fade-in">
          <p>No projects match your search.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deletingId === project._id}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
