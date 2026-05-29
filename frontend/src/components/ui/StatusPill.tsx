
import type { ProjectStatus } from '../../types';

interface StatusPillProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  draft:        { label: 'Draft',       color: '#5a7a7a', bg: '#e8f4f4' },
  'in-progress':{ label: 'In Progress', color: '#e67e22', bg: '#fef5e7' },
  complete:     { label: 'Complete',    color: '#27ae60', bg: '#eafaf1' },
};

export default function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.8rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: config.bg,
        color: config.color,
        padding,
        borderRadius: 20,
        fontSize,
        fontWeight: 600,
        border: `1px solid ${config.color}30`,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: config.color,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
