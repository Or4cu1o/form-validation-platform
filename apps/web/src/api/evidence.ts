import { apiGet } from '../lib/api-client';

export function getEvidenceDownloadUrl(id: string): Promise<{ url: string }> {
  return apiGet<{ url: string }>(`/evidence-files/${encodeURIComponent(id)}/download-url`);
}
