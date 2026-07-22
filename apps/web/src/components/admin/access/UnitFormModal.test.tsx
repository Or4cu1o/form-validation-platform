import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { UnitFormModal } from './UnitFormModal';
import { renderWithProviders } from '../../../test/render-with-providers';
import * as unitsApi from '../../../api/units';
import type { Unit } from '../../../types/api';

vi.mock('../../../api/units');

const existingUnit: Unit = {
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

describe('UnitFormModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires sigla and nome before submitting', () => {
    renderWithProviders(<UnitFormModal isOpen onClose={vi.fn()} formTemplates={[]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Criar unidade' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Preencha sigla e nome.');
    expect(unitsApi.createUnit).not.toHaveBeenCalled();
  });

  it('creates a unit once sigla and nome are filled', async () => {
    vi.mocked(unitsApi.createUnit).mockResolvedValueOnce(existingUnit);
    const onClose = vi.fn();

    renderWithProviders(<UnitFormModal isOpen onClose={onClose} formTemplates={[]} />);

    fireEvent.change(screen.getByLabelText(/^Sigla/), { target: { value: 'RH' } });
    fireEvent.change(screen.getByLabelText(/^Nome/), { target: { value: 'Recursos Humanos' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar unidade' }));
    });

    expect(unitsApi.createUnit).toHaveBeenCalledWith({
      sigla: 'RH',
      nome: 'Recursos Humanos',
      logoUrl: undefined,
      level: 'C',
      formTemplateId: undefined,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('pre-fills fields and updates an existing unit', async () => {
    vi.mocked(unitsApi.updateUnit).mockResolvedValueOnce(existingUnit);

    renderWithProviders(<UnitFormModal isOpen onClose={vi.fn()} formTemplates={[]} unit={existingUnit} />);

    expect(screen.getByLabelText(/^Sigla/)).toHaveValue('TI');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    });

    expect(unitsApi.updateUnit).toHaveBeenCalledWith('unit-1', {
      sigla: 'TI',
      nome: 'Tecnologia da Informação',
      logoUrl: undefined,
      level: 'A',
      formTemplateId: undefined,
    });
  });
});
