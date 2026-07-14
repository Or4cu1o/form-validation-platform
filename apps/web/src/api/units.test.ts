import { describe, expect, it, vi } from 'vitest';
import { activateUnit, createUnit, deactivateUnit, getUnit, listUnits, updateUnit } from './units';
import { apiGet, apiSend } from '../lib/api-client';

vi.mock('../lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('../lib/api-client')>('../lib/api-client');
  return { ...actual, apiGet: vi.fn(), apiSend: vi.fn() };
});

describe('units api', () => {
  it('listUnits defaults includeInactive to false', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce([] as never);
    await listUnits();
    expect(apiGet).toHaveBeenCalledWith('/admin/units?includeInactive=false');
  });

  it('listUnits includes includeInactive when true', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce([] as never);
    await listUnits(true);
    expect(apiGet).toHaveBeenCalledWith('/admin/units?includeInactive=true');
  });

  it('getUnit fetches by id', async () => {
    vi.mocked(apiGet).mockResolvedValueOnce({} as never);
    await getUnit('unit-1');
    expect(apiGet).toHaveBeenCalledWith('/admin/units/unit-1');
  });

  it('createUnit posts the unit payload', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    const input = { sigla: 'TI', nome: 'Tecnologia', level: 'A' as const };
    await createUnit(input);
    expect(apiSend).toHaveBeenCalledWith('POST', '/admin/units', input);
  });

  it('updateUnit patches the unit by id', async () => {
    vi.mocked(apiSend).mockResolvedValueOnce({} as never);
    await updateUnit('unit-1', { nome: 'Novo nome' });
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/units/unit-1', { nome: 'Novo nome' });
  });

  it('deactivateUnit and activateUnit hit their respective actions', async () => {
    vi.mocked(apiSend).mockResolvedValue({} as never);
    await deactivateUnit('unit-1');
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/units/unit-1/deactivate');
    await activateUnit('unit-1');
    expect(apiSend).toHaveBeenCalledWith('PATCH', '/admin/units/unit-1/activate');
  });
});
