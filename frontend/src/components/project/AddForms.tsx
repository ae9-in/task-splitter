import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import './AddForms.css';

interface AddTaskFormProps {
  onAdd: (title: string, description: string) => void;
  onCancel: () => void;
}

export function AddTaskForm({ onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) onAdd(title.trim(), desc.trim());
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="add-form-input"
        placeholder="Task title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        id="add-task-input"
      />
      <textarea
        className="add-form-textarea"
        placeholder="Description (optional)…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={2}
      />
      <div className="add-form-actions">
        <button type="submit" className="add-form-btn add-form-btn-confirm" disabled={!title.trim()}>
          <Check size={14} /> Add Task
        </button>
        <button type="button" className="add-form-btn add-form-btn-cancel" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  );
}

interface AddFeatureFormProps {
  onAdd: (name: string, description: string) => void;
  onCancel: () => void;
}

export function AddFeatureForm({ onAdd, onCancel }: AddFeatureFormProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onAdd(name.trim(), desc.trim());
  };

  return (
    <form className="add-form add-form-feature" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="add-form-input"
        placeholder="Feature name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        id="add-feature-input"
      />
      <textarea
        className="add-form-textarea"
        placeholder="Description (optional)…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={2}
      />
      <div className="add-form-actions">
        <button type="submit" className="add-form-btn add-form-btn-confirm" disabled={!name.trim()}>
          <Check size={14} /> Add Feature
        </button>
        <button type="button" className="add-form-btn add-form-btn-cancel" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  );
}

interface AddModuleFormProps {
  onAdd: (name: string, description: string) => void;
  onCancel: () => void;
}

export function AddModuleForm({ onAdd, onCancel }: AddModuleFormProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onAdd(name.trim(), desc.trim());
  };

  return (
    <form className="add-form add-form-module" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="add-form-input"
        placeholder="Module name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        id="add-module-input"
      />
      <textarea
        className="add-form-textarea"
        placeholder="Description (optional)…"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={2}
      />
      <div className="add-form-actions">
        <button type="submit" className="add-form-btn add-form-btn-confirm" disabled={!name.trim()}>
          <Check size={14} /> Add Module
        </button>
        <button type="button" className="add-form-btn add-form-btn-cancel" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  );
}
