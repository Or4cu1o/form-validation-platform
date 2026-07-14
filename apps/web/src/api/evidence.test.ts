import { describe, expect, it, vi } from 'vitest';
import { getEvidenceDownloadUrl } from './evidence';
import { apiGet } from '../lib/api-client';

vi.mock('../lib/api-client');

describe('evidence api', () => {
  it('requests a download URL for the given evidence file id', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({ url: 'https://files/evidence-1' } as never);
    const result = await getEvidenceDownloadUrl('evidence-1');
    expect(apiGet).toHaveBeenCalledWith('/evidence-files/evidence-1/download-url');
    expect(result.url).toBe('https://files/evidence-1');
  });
});
