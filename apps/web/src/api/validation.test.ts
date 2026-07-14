import { describe, expect, it, vi } from 'vitest';
import { uploadValidationEvidence, validateIndicator } from './validation';
import { apiSend, apiUpload } from '../lib/api-client';

vi.mock('../lib/api-client');

describe('validation api', () => {
  it('validateIndicator posts verdict and justification', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await validateIndicator('response-1', 'APROVADO', 'Dentro da meta esperada.');
    expect(apiSend).toHaveBeenCalledWith('POST', '/indicator-responses/response-1/validate', {
      verdict: 'APROVADO',
      justification: 'Dentro da meta esperada.',
    });
  });

  it('uploadValidationEvidence sends the file to the validation record endpoint', async () => {
    vi.mocked(apiUpload).mockResolvedValueOnce({} as never);
    const file = new File(['x'], 'evidencia.pdf', { type: 'application/pdf' });
    await uploadValidationEvidence('record-1', file);
    expect(apiUpload).toHaveBeenCalledWith('/validation-records/record-1/evidence', file);
  });
});
