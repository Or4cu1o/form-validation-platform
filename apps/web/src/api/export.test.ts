import { describe, expect, it, vi } from 'vitest';
import { exportReportInstance, getExportSettings, updateExportSettings } from './export';
import { apiDownloadBlob, apiGet, apiSend } from '../lib/api-client';

vi.mock('../lib/api-client');

describe('export api', () => {
  it('exportReportInstance requests a blob with the requested format', async () => {
    vi.mocked(apiDownloadBlob).mockResolvedValueOnce({ blob: new Blob(), filename: 'x.csv' });
    await exportReportInstance('report-1', 'csv');
    expect(apiDownloadBlob).toHaveBeenCalledWith('/report-instances/report-1/export?format=csv');
  });

  it('getExportSettings fetches the current settings', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({} as never);
    await getExportSettings();
    expect(apiGet).toHaveBeenCalledWith('/admin/export-settings');
  });

  it('updateExportSettings patches the naming pattern', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await updateExportSettings('{unidade}-{mes}');
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/export-settings', {
      exportNamingPattern: '{unidade}-{mes}',
    });
  });
});
