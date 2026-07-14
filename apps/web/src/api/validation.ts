import { apiSend, apiUpload } from '../lib/api-client';
import type { EvidenceFile, ValidationRecord, ValidationVerdict } from '../types/api';

export function validateIndicator(
  indicatorResponseId: string,
  verdict: ValidationVerdict,
  justification: string,
): Promise<ValidationRecord> {
  return apiSend<ValidationRecord>('POST', `/indicator-responses/${encodeURIComponent(indicatorResponseId)}/validate`, {
    verdict,
    justification,
  });
}

export function uploadValidationEvidence(validationRecordId: string, file: File): Promise<EvidenceFile> {
  return apiUpload<EvidenceFile>(`/validation-records/${encodeURIComponent(validationRecordId)}/evidence`, file);
}
