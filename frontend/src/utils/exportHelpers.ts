import type { ExportFormat } from '../types';

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getExportFilename(title: string, format: ExportFormat): string {
  const safe = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const ext = format === 'markdown' ? 'md' : format;
  return `${safe}.${ext}`;
}
