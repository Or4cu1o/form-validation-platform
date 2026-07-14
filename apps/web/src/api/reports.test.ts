import { describe, expect, it, vi } from 'vitest';
import {
  finalizeReportInstance,
  getReportInstance,
  listReportInstances,
  submitForApproval,
  submitForReview,
} from './reports';
import { apiGet, apiSend } from '../lib/api-client';

vi.mock('../lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('../lib/api-client')>('../lib/api-client');
  return { ...actual, apiGet: vi.fn(), apiSend: vi.fn() };
});

describe('reports api', () => {
  it('listReportInstances builds a query string from filters', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce([] as never);
    await listReportInstances({ status: 'PENDENTE', unitId: 'unit-1' });
    expect(apiGet).toHaveBeenCalledWith('/report-instances?status=PENDENTE&unitId=unit-1');
  });

  it('listReportInstances omits the query string when no filters are set', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce([] as never);
    await listReportInstances({});
    expect(apiGet).toHaveBeenCalledWith('/report-instances');
  });

  it('getReportInstance fetches by id', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({} as never);
    await getReportInstance('report-1');
    expect(apiGet).toHaveBeenCalledWith('/report-instances/report-1');
  });

  it('submitForReview posts to the submit-for-review action', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await submitForReview('report-1');
    expect(apiSend).toHaveBeenCalledWith('POST', '/report-instances/report-1/submit-for-review');
  });

  it('submitForApproval posts to the submit-for-approval action', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await submitForApproval('report-1');
    expect(apiSend).toHaveBeenCalledWith('POST', '/report-instances/report-1/submit-for-approval');
  });

  it('finalizeReportInstance posts to the finalize action', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await finalizeReportInstance('report-1');
    expect(apiSend).toHaveBeenCalledWith('POST', '/report-instances/report-1/finalize');
  });

  it('percent-encodes an id containing path-traversal characters instead of embedding it raw', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({} as never);
    await getReportInstance('../admin/units');
    expect(apiGet).toHaveBeenCalledWith('/report-instances/..%2Fadmin%2Funits');
  });
});
