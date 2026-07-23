import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ReportDetailPage } from './ReportDetailPage';
import { renderWithProviders } from '../test/render-with-providers';
import { makeReportInstance, makeUser } from '../test/fixtures';
import * as reportsApi from '../api/reports';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../api/reports');
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../context/AuthContext')>('../context/AuthContext');
  return { ...actual, useAuth: vi.fn() };
});

function renderDetail(reportId = 'report-1') {
  return renderWithProviders(
    <MemoryRouter initialEntries={[`/relatorios/${reportId}`]}>
      <Routes>
        <Route path="/relatorios/:id" element={<ReportDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ReportDetailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an empty state when the report cannot be loaded', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser(), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.getReportInstance).mockRejectedValueOnce(new Error('not found'));

    renderDetail();

    expect(await screen.findByText('Relatório não encontrado')).toBeInTheDocument();
  });

  it('shows the "Enviar para revisão" action for an ELABORADOR on their own PENDENTE report', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser({ role: 'ELABORADOR', primaryUnitId: 'unit-1' }), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.getReportInstance).mockResolvedValueOnce(makeReportInstance({ status: 'PENDENTE', unitId: 'unit-1' }));

    renderDetail();

    expect(await screen.findByRole('button', { name: 'Enviar para revisão' })).toBeInTheDocument();
  });

  it('does not show submit actions for a REVISOR on a report from another unit', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser({ role: 'REVISOR', primaryUnitId: 'unit-2' }), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.getReportInstance).mockResolvedValueOnce(makeReportInstance({ status: 'EM_REVISAO', unitId: 'unit-1' }));

    renderDetail();

    await screen.findByText('TI · março de 2026');
    expect(screen.queryByRole('button', { name: 'Enviar para aprovação' })).not.toBeInTheDocument();
  });

  it('shows the reproval banner when the report was sent back from the Matriz', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser({ role: 'REVISOR', primaryUnitId: 'unit-1' }), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.getReportInstance).mockResolvedValueOnce(
      makeReportInstance({ status: 'EM_REVISAO', unitId: 'unit-1', reprovalCount: 1 }),
    );

    renderDetail();

    expect(await screen.findByText(/reprovado pela Matriz/)).toBeInTheDocument();
  });

  it('shows an empty state when the report has no indicators', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser(), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.getReportInstance).mockResolvedValueOnce(makeReportInstance({ indicatorResponses: [] }));

    renderDetail();

    expect(await screen.findByText('Sem indicadores')).toBeInTheDocument();
  });

  it('shows the final score banner for a concluded report', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser(), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.getReportInstance).mockResolvedValueOnce(
      makeReportInstance({
        status: 'CONCLUIDO',
        indicatorScore: '10',
        slaDeflatorApplied: '2',
        totalScore: '8',
        isElaborationOnTime: true,
        isReviewOnTime: false,
      }),
    );

    renderDetail();

    expect(await screen.findByText('Nota final do relatório')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
  });

  it('does not show the final score banner when the report has not been scored yet', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser(), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.getReportInstance).mockResolvedValueOnce(makeReportInstance({ status: 'PENDENTE' }));

    renderDetail();

    await screen.findByText(/Elaboração e revisão/);
    expect(screen.queryByText('Nota final do relatório')).not.toBeInTheDocument();
  });
});
