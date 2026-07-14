import { describe, expect, it, vi } from 'vitest';
import { fetchCurrentUser, login } from './auth';
import { apiGet, apiSend } from '../lib/api-client';

vi.mock('../lib/api-client');

describe('auth api', () => {
  it('login sends identifier and password to /auth/login', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await login('12345', 'secret');
    expect(apiSend).toHaveBeenCalledWith('POST', '/auth/login', { identifier: '12345', password: 'secret' });
  });

  it('fetchCurrentUser calls GET /auth/me', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({} as never);
    await fetchCurrentUser();
    expect(apiGet).toHaveBeenCalledWith('/auth/me');
  });
});
