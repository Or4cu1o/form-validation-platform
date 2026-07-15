import { apiSend, apiUpload } from '../lib/api-client';
import type { EvidenceFile, IndicatorResponse } from '../types/api';

export function updateIndicatorResponseValues(
  id: string,
  variableValues: Record<string, number>,
  criticalAnalysis?: string,
  actionPlan?: string,
): Promise<IndicatorResponse> {
  return apiSend<IndicatorResponse>('PATCH', `/indicator-responses/${encodeURIComponent(id)}`, {
    variableValues,
    criticalAnalysis,
    actionPlan,
  });
}

export function uploadIndicatorEvidence(id: string, file: File): Promise<EvidenceFile> {
  return apiUpload<EvidenceFile>(`/indicator-responses/${encodeURIComponent(id)}/evidence`, file);
}
