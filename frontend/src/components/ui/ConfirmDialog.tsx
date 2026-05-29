
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: variant === 'danger' ? 'var(--danger-light)' : 'var(--warning-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: variant === 'danger' ? 'var(--danger)' : 'var(--warning)',
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <h4 style={{ fontSize: '1.0625rem', marginBottom: 8, color: 'var(--text-primary)' }}>
          {title}
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'secondary'}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
