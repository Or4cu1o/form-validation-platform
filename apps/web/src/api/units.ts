import { apiGet, apiSend, buildQueryString } from '../lib/api-client';
import type { Unit, UnitLevel } from '../types/api';

export interface UnitInput {
  sigla: string;
  nome: string;
  logoUrl?: string;
  level: UnitLevel;
  formTemplateId?: string;
}

export function listUnits(includeInactive = false): Promise<Unit[]> {
  return apiGet<Unit[]>(`/admin/units${buildQueryString({ includeInactive })}`);
}

export function getUnit(id: string): Promise<Unit> {
  return apiGet<Unit>(`/admin/units/${encodeURIComponent(id)}`);
}

export function createUnit(input: UnitInput): Promise<Unit> {
  return apiSend<Unit>('POST', '/admin/units', input);
}

export function updateUnit(id: string, input: Partial<UnitInput>): Promise<Unit> {
  return apiSend<Unit>('PATCH', `/admin/units/${encodeURIComponent(id)}`, input);
}

export function deactivateUnit(id: string): Promise<Unit> {
  return apiSend<Unit>('PATCH', `/admin/units/${encodeURIComponent(id)}/deactivate`);
}

export function activateUnit(id: string): Promise<Unit> {
  return apiSend<Unit>('PATCH', `/admin/units/${encodeURIComponent(id)}/activate`);
}
