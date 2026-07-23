import { describe, expect, it, vi } from 'vitest';
import { exportReportInstance } from './export';
import { apiDownloadBlob } from '../lib/api-client';

vi.mock('../lib/api-client');

describe('export api', () => {
  it('exportReportInstance requests a blob with the requested format', async () => {
    vi.mocked(apiDownloadBlob).mockResolvedValueOnce({ blob: new Blob(), filename: 'x.csv' });
    await exportReportInstance('report-1', 'csv');
    expect(apiDownloadBlob).toHaveBeenCalledWith('/report-instances/report-1/export?format=csv');
  });
});
