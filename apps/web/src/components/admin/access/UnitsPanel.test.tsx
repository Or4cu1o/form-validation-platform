import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { UnitsPanel } from './UnitsPanel';
import { renderWithProviders } from '../../../test/render-with-providers';
import * as unitsApi from '../../../api/units';
import * as formsApi from '../../../api/forms';
import type { Unit } from '../../../types/api';

vi.mock('../../../api/units');
vi.mock('../../../api/forms');

const unit: Unit = {
  id: 'unit-1',
  sigla: 'TI',
  nome: 'Tecnologia da Informação',
  logoUrl: null,
  level: 'A',
  formTemplateId: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  formTemplate: null,
};

describe('UnitsPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the unit list from the API', async () => {
    vi.mocked(unitsApi.listUnits).mockResolvedValueOnce([unit]);
    vi.mocked(formsApi.listFormTemplates).mockResolvedValueOnce([]);

    renderWithProviders(<UnitsPanel />);

    expect(await screen.findByText('Tecnologia da Informação')).toBeInTheDocument();
  });

  it('toggles a unit active status', async () => {
    vi.mocked(unitsApi.listUnits).mockResolvedValue([unit]);
    vi.mocked(formsApi.listFormTemplates).mockResolvedValueOnce([]);
    vi.mocked(unitsApi.deactivateUnit).mockResolvedValueOnce({ ...unit, isActive: false });

    renderWithProviders(<UnitsPanel />);
    await screen.findByText('Tecnologia da Informação');

    await act(async () => {
      fireEvent.click(screen.getByTitle('Desativar'));
    });

    expect(unitsApi.deactivateUnit).toHaveBeenCalledWith('unit-1');
  });
});
