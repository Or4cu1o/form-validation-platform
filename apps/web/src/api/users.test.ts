import { describe, expect, it, vi } from 'vitest';
import {
  activateUser,
  createUser,
  deactivateUser,
  getUser,
  grantUnitAccess,
  listUsers,
  resetPassword,
  revokeUnitAccess,
  updateUser,
} from './users';
import { apiGet, apiSend } from '../lib/api-client';

vi.mock('../lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('../lib/api-client')>('../lib/api-client');
  return { ...actual, apiGet: vi.fn(), apiSend: vi.fn() };
});

describe('users api', () => {
  it('listUsers defaults includeInactive to false', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce([] as never);
    await listUsers();
    expect(apiGet).toHaveBeenCalledWith('/admin/users?includeInactive=false');
  });

  it('getUser fetches by id', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({} as never);
    await getUser('user-1');
    expect(apiGet).toHaveBeenCalledWith('/admin/users/user-1');
  });

  it('createUser posts the full payload', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    const input = {
      matricula: '001',
      nome: 'Ana',
      sobrenome: 'Silva',
      email: 'ana@example.com',
      password: 'senha-forte',
      role: 'ELABORADOR' as const,
      primaryUnitId: 'unit-1',
    };
    await createUser(input);
    expect(apiSend).toHaveBeenCalledWith('POST', '/admin/users', input);
  });

  it('updateUser patches by id', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await updateUser('user-1', { nome: 'Novo' });
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/users/user-1', { nome: 'Novo' });
  });

  it('resetPassword sends the new password', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({ success: true });
    await resetPassword('user-1', 'nova-senha-123');
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/users/user-1/reset-password', {
      newPassword: 'nova-senha-123',
    });
  });

  it('deactivateUser and activateUser hit their respective actions', async () => {
    vi.mocked(apiSend).mockResolvedValue({} as never);
    await deactivateUser('user-1');
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/users/user-1/deactivate');
    await activateUser('user-1');
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/users/user-1/activate');
  });

  it('grantUnitAccess and revokeUnitAccess post the unit id', async () => {
    vi.mocked(apiSend).mockResolvedValue({} as never);
    await grantUnitAccess('user-1', 'unit-2');
    expect(apiSend).toHaveBeenCalledWith('POST', '/admin/users/user-1/unit-access', { unitId: 'unit-2' });
    await revokeUnitAccess('user-1', 'unit-2');
    expect(apiSend).toHaveBeenCalledWith('POST', '/admin/users/user-1/unit-access/revoke', { unitId: 'unit-2' });
  });
});
