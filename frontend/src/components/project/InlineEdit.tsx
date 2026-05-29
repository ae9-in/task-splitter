import React, { useState, useRef, useEffect } from 'react';
import './InlineEdit.css';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  textClassName?: string;
  minLength?: number;
  maxLength?: number;
  fontSize?: string;
  fontWeight?: string | number;
  color?: string;
}

export default function InlineEdit({
  value,
  onSave,
  placeholder = 'Click to edit…',
  multiline = false,
  className = '',
  minLength = 1,
  maxLength = 500,
  fontSize,
  fontWeight,
  color,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const el = inputRef.current as HTMLInputElement;
      el.selectionStart = el.selectionEnd = el.value.length;
    }
  }, [editing]);

  const handleStart = () => {
    setDraft(value);
    setEditing(true);
  };

  const handleConfirm = () => {
    const trimmed = draft.trim();
    if (trimmed.length >= minLength) {
      onSave(trimmed);
    } else {
      setDraft(value); // revert
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  const sharedStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    color,
  };

  if (!editing) {
    return (
      <span
        className={`inline-edit-display ${className} ${!value ? 'inline-edit-empty' : ''}`}
        onClick={handleStart}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        title="Click to edit"
        style={sharedStyle}
      >
        {value || placeholder}
      </span>
    );
  }

  const commonProps = {
    ref: inputRef as React.RefObject<HTMLInputElement>,
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: handleConfirm,
    onKeyDown: handleKeyDown,
    maxLength,
    className: `inline-edit-input ${className}`,
    style: sharedStyle,
  };

  if (multiline) {
    return (
      <textarea
        {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        rows={3}
        className={`inline-edit-input inline-edit-textarea ${className}`}
      />
    );
  }

  return <input type="text" {...commonProps} />;
}
