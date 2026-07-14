import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ValidationBoardPage } from './ValidationBoardPage';
import { renderWithProviders } from '../test/render-with-providers';
import { makeReportInstance, makeUnit } from '../test/fixtures';
import * as reportsApi from '../api/reports';

vi.mock('../api/reports');

function renderBoard() {
  return renderWithProviders(
    <MemoryRouter>
      <ValidationBoardPage />
    </MemoryRouter>,
  );
}

describe('ValidationBoardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deduplicates reports by unit, keeping only the latest per unit', async () => {
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([
      makeReportInstance({ id: 'report-1', unitId: 'unit-1', referenceMonth: '2026-03-01' }),
      makeReportInstance({ id: 'report-2', unitId: 'unit-1', referenceMonth: '2026-02-01' }),
    ]);

    renderBoard();

    await screen.findByText('TI');
    expect(screen.getAllByText('TI')).toHaveLength(1);
  });

  it('shows the pending-approval banner when at least one unit is PENDENTE_APROVACAO', async () => {
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([
      makeReportInstance({ status: 'PENDENTE_APROVACAO' }),
    ]);

    renderBoard();

    expect(await screen.findByText(/aguardando contraprova da Matriz/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Validar' })).toBeInTheDocument();
  });

  it('links to the report with "Ver" when it is not pending approval', async () => {
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([
      makeReportInstance({ status: 'CONCLUIDO', unit: makeUnit({ sigla: 'RH', nome: 'Recursos Humanos' }) }),
    ]);

    renderBoard();

    expect(await screen.findByRole('link', { name: 'Ver' })).toBeInTheDocument();
  });

  it('shows an empty state when no units match the filter', async () => {
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([]);

    renderBoard();

    expect(await screen.findByText('Nenhuma unidade encontrada')).toBeInTheDocument();
  });
});
