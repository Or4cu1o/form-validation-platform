import { describe, expect, it, vi } from 'vitest';
import { updateIndicatorResponseValues, uploadIndicatorEvidence } from './indicator-responses';
import { apiSend, apiUpload } from '../lib/api-client';

vi.mock('../lib/api-client');

describe('indicator-responses api', () => {
  it('updateIndicatorResponseValues patches variableValues by id', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await updateIndicatorResponseValues('response-1', { uptime: 1430 });
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/indicator-responses/response-1', {
      variableValues: { uptime: 1430 },
    });
  });

  it('uploadIndicatorEvidence sends the file to the indicator response evidence endpoint', async () => {
    vi.mocked(apiUpload).mockResolvedValueOnce({} as never);
    const file = new File(['x'], 'evidencia.pdf', { type: 'application/pdf' });
    await uploadIndicatorEvidence('response-1', file);
    expect(apiUpload).toHaveBeenCalledWith('/indicator-responses/response-1/evidence', file);
  });
});
