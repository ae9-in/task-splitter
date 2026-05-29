import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { createProject, splitProject } from '../api/projects';
import type { Project } from '../types';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import './NewProjectPage.css';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirementText, setRequirementText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<'idle' | 'creating' | 'splitting'>('idle');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3)
      errs.title = 'Title must be at least 3 characters';
    if (!requirementText.trim() || requirementText.trim().length < 50)
      errs.requirementText = 'Requirement must be at least 50 characters for a meaningful split';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      setStage('creating');
      const project: Project = await createProject({
        title: title.trim(),
        description: description.trim(),
        requirementText: requirementText.trim(),
      });

      setStage('splitting');
      const split = await splitProject(project._id);
      return split;
    },
    onSuccess: (project: Project) => {
      toast.success('Requirements split successfully!');
      navigate(`/projects/${project._id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to process requirements. Please try again.';
      toast.error(msg);
      setStage('idle');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  const isLoading = stage !== 'idle';
  const reqLength = requirementText.length;
  const reqTooShort = reqLength > 0 && reqLength < 50;

  return (
    <PageWrapper>
      <div className="new-project-container">
        <div className="new-project-back">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="new-project-card card fade-in">
          <div className="new-project-header">
            <div className="new-project-icon">
              <Wand2 size={22} />
            </div>
            <div>
              <h1 className="new-project-title">New Project</h1>
              <p className="new-project-subtitle">
                Paste your requirement document — AI will decompose it into modules, features, and tasks.
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="new-project-loading fade-in">
              <div className="spinner spinner-lg" />
              <div>
                <p className="new-project-loading-title">
                  {stage === 'creating' ? 'Creating project…' : 'Analysing your requirements…'}
                </p>
                <p className="new-project-loading-sub">
                  {stage === 'splitting'
                    ? 'Claude is decomposing your requirements into modules, features and tasks. This may take a moment.'
                    : 'Setting up your project…'}
                </p>
              </div>
            </div>
          )}

          {!isLoading && (
            <form onSubmit={handleSubmit} className="new-project-form">
              <div className="form-group">
                <label htmlFor="project-title" className="form-label">
                  Project Title <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="project-title"
                  type="text"
                  className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                  placeholder="e.g. E-Commerce Platform v2"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: '' }); }}
                  maxLength={120}
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="project-desc" className="form-label">
                  Short Description <span style={{ color: 'var(--text-light)' }}>(optional)</span>
                </label>
                <input
                  id="project-desc"
                  type="text"
                  className="form-input"
                  placeholder="One or two sentences about this project…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={250}
                />
              </div>

              <div className="form-group">
                <label htmlFor="project-requirement" className="form-label">
                  Requirement Document <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  id="project-requirement"
                  className={`form-textarea new-project-textarea ${errors.requirementText ? 'form-input-error' : ''}`}
                  placeholder="Paste your requirement document here — free-form text, bullet points, paragraphs. The more detail you provide, the better the decomposition."
                  value={requirementText}
                  onChange={(e) => { setRequirementText(e.target.value); setErrors({ ...errors, requirementText: '' }); }}
                  rows={10}
                />
                <div className="new-project-req-footer">
                  {reqTooShort && (
                    <p className="form-error">
                      ⚠ At least 50 characters recommended for a meaningful split ({reqLength}/50)
                    </p>
                  )}
                  <span className="new-project-char-count" style={{ marginLeft: 'auto' }}>
                    {reqLength.toLocaleString()} characters
                  </span>
                </div>
                {errors.requirementText && !reqTooShort && (
                  <p className="form-error">{errors.requirementText}</p>
                )}
              </div>

              <div className="new-project-submit-row">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={<Wand2 size={17} />}
                  iconPosition="right"
                  loading={isLoading}
                  id="split-requirements-btn"
                >
                  Split Requirements →
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
