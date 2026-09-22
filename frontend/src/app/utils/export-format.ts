/**
 * Export Formatter Utility (TypeScript)
 * Cloned in export-format-legacy.ts for jscpd duplication detection.
 */

export interface ExportRecord {
  id?: string;
  title?: string;
  description?: string;
  createdAt?: string;
}

export function formatRecordToCsvRow(record: ExportRecord): string {
  if (!record || typeof record !== 'object') return '';
  const id = String(record.id || '').replace(/"/g, '""');
  const title = String(record.title || '').replace(/"/g, '""');
  const desc = String(record.description || '').replace(/"/g, '""');
  const createdAt = String(record.createdAt || '');

  return `"${id}","${title}","${desc}","${createdAt}"`;
}

export function exportRecordsToCsv(records: ExportRecord[]): string {
  if (!Array.isArray(records) || records.length === 0) {
    return 'id,title,description,createdAt\n';
  }
  const header = 'id,title,description,createdAt\n';
  const rows = records.map((r) => formatRecordToCsvRow(r)).join('\n');
  return header + rows;
}
