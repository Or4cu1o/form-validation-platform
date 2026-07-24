import { apiGet, apiSend, buildQueryString } from '../lib/api-client';
import type { ReportInstance, ReportInstanceOverview, ReportStatus } from '../types/api';

export interface ListReportsParams {
  unitId?: string;
  status?: ReportStatus;
  referenceMonthFrom?: string;
  referenceMonthTo?: string;
  search?: string;
  sortBy?: 'referenceMonth' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export function listReportInstances(params: ListReportsParams): Promise<ReportInstance[]> {
  return apiGet<ReportInstance[]>(`/report-instances${buildQueryString(params)}`);
}

export function getReportInstancesOverview(params: ListReportsParams = {}): Promise<ReportInstanceOverview[]> {
  return apiGet<ReportInstanceOverview[]>(`/report-instances/overview${buildQueryString(params)}`);
}

export function getReportInstance(id: string): Promise<ReportInstance> {
  return apiGet<ReportInstance>(`/report-instances/${encodeURIComponent(id)}`);
}

export function submitForReview(id: string): Promise<ReportInstance> {
  return apiSend<ReportInstance>('POST', `/report-instances/${encodeURIComponent(id)}/submit-for-review`);
}

export function submitForApproval(id: string): Promise<ReportInstance> {
  return apiSend<ReportInstance>('POST', `/report-instances/${encodeURIComponent(id)}/submit-for-approval`);
}

export function finalizeReportInstance(id: string): Promise<ReportInstance> {
  return apiSend<ReportInstance>('POST', `/report-instances/${encodeURIComponent(id)}/finalize`);
}

export function startCurrentReportInstance(): Promise<ReportInstance> {
  return apiSend<ReportInstance>('POST', '/report-instances/start-current');
}
