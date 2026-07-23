import { apiDownloadBlob } from '../lib/api-client';

export function exportReportInstance(id: string, format: 'csv' | 'json'): Promise<{ blob: Blob; filename: string | null }> {
  return apiDownloadBlob(`/report-instances/${encodeURIComponent(id)}/export?format=${format}`);
}
