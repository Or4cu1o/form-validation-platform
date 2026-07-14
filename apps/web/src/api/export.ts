import { apiDownloadBlob, apiGet, apiSend } from '../lib/api-client';
import type { SystemSetting } from '../types/api';

export function exportReportInstance(id: string, format: 'csv' | 'json'): Promise<{ blob: Blob; filename: string | null }> {
  return apiDownloadBlob(`/report-instances/${encodeURIComponent(id)}/export?format=${format}`);
}

export function getExportSettings(): Promise<SystemSetting> {
  return apiGet<SystemSetting>('/admin/export-settings');
}

export function updateExportSettings(exportNamingPattern: string): Promise<SystemSetting> {
  return apiSend<SystemSetting>('PATCH', '/admin/export-settings', { exportNamingPattern });
}
