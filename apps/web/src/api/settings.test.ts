import { describe, expect, it, vi } from 'vitest';
import { getPlatformSettings, updatePlatformSettings } from './settings';
import { apiGet, apiSend } from '../lib/api-client';

vi.mock('../lib/api-client');

describe('settings api', () => {
  it('getPlatformSettings fetches the current settings', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({} as never);
    await getPlatformSettings();
    expect(apiGet).toHaveBeenCalledWith('/admin/platform-settings');
  });

  it('updatePlatformSettings patches only the provided fields', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await updatePlatformSettings({ exportNamingPattern: '{unidade}-{mes}', slaDeflatorScore: 1.5 });
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/platform-settings', {
      exportNamingPattern: '{unidade}-{mes}',
      slaDeflatorScore: 1.5,
    });
  });
});
