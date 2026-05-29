import React, { useRef, useState } from 'react';
import { Download, FileText, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import type { ExportFormat } from '../../types';
import { exportProject } from '../../api/projects';
import { triggerDownload, getExportFilename } from '../../utils/exportHelpers';
import toast from 'react-hot-toast';
import './ExportMenu.css';

interface ExportMenuProps {
  projectId: string;
  projectTitle: string;
}

const FORMATS: { format: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
  { format: 'markdown', label: 'Markdown', icon: <FileText size={16} />, desc: '.md with checkboxes' },
  { format: 'json',     label: 'JSON',     icon: <FileJson size={16} />, desc: 'Raw structured data' },
  { format: 'csv',      label: 'CSV',      icon: <FileSpreadsheet size={16} />, desc: 'Flat table format' },
];

export default function ExportMenu({ projectId, projectTitle }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ExportFormat) => {
    setLoading(format);
    setOpen(false);
    try {
      const response = await exportProject(projectId, format);
      const blob = new Blob([response.data]);
      triggerDownload(blob, getExportFilename(projectTitle, format));
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="export-menu" ref={containerRef}>
      <button
        className="export-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        disabled={!!loading}
        id="export-menu-trigger"
      >
        {loading ? (
          <span className="spinner" style={{ width: 15, height: 15 }} />
        ) : (
          <Download size={15} />
        )}
        <span>Export</span>
        <ChevronDown size={13} style={{ opacity: 0.7, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div className="export-dropdown fade-in" role="menu">
          {FORMATS.map(({ format, label, icon, desc }) => (
            <button
              key={format}
              className="export-item"
              role="menuitem"
              onClick={() => handleExport(format)}
              id={`export-${format}`}
            >
              <span className="export-item-icon">{icon}</span>
              <span className="export-item-text">
                <span className="export-item-label">{label}</span>
                <span className="export-item-desc">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="export-overlay" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
