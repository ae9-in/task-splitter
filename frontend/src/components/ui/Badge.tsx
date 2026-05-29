import React from 'react';
import type { TaskPriority, TaskType } from '../../types';
import { PRIORITY_COLORS, PRIORITY_BG, TYPE_COLORS, TYPE_BG } from '../../utils/formatters';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

interface TypeBadgeProps {
  type: TaskType;
  size?: 'sm' | 'md';
}

const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '4px',
  fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
  textTransform: 'capitalize',
  letterSpacing: '0.02em',
};

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const padding = size === 'sm' ? '2px 7px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.8125rem';
  return (
    <span
      style={{
        ...badgeBase,
        background: PRIORITY_BG[priority],
        color: PRIORITY_COLORS[priority],
        padding,
        fontSize,
        border: `1px solid ${PRIORITY_COLORS[priority]}33`,
      }}
    >
      {priority}
    </span>
  );
}

export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  const padding = size === 'sm' ? '2px 7px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.8125rem';
  return (
    <span
      style={{
        ...badgeBase,
        background: TYPE_BG[type],
        color: TYPE_COLORS[type],
        padding,
        fontSize,
        border: `1px solid ${TYPE_COLORS[type]}33`,
      }}
    >
      {type}
    </span>
  );
}

interface CountBadgeProps {
  count: number;
  label: string;
  color?: string;
}

export function CountBadge({ count, label, color = 'var(--teal-dark)' }: CountBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: `${color}15`,
        color,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: `1px solid ${color}25`,
      }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      <span style={{ opacity: 0.75 }}>{label}</span>
    </span>
  );
}
