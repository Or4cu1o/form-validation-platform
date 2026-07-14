import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { renderWithProviders } from '../test/render-with-providers';
import { makeReportInstance, makeUser } from '../test/fixtures';
import * as reportsApi from '../api/reports';
import * as exportApi from '../api/export';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../api/reports');
vi.mock('../api/export');
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../context/AuthContext')>('../context/AuthContext');
  return { ...actual, useAuth: vi.fn() };
});

function renderDashboard() {
  return renderWithProviders(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders report rows from the API for an allowed role', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser({ role: 'ELABORADOR' }), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([makeReportInstance()]);

    renderDashboard();

    expect(await screen.findByText('Tecnologia da Informação')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver' })).toBeInTheDocument();
  });

  it('shows an empty state when there are no reports', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser(), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByText('Nenhum relatório encontrado')).toBeInTheDocument();
  });

  it('hides the "Ver" link for roles without report-detail access', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser({ role: 'OBSERVADOR' }), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([makeReportInstance()]);

    renderDashboard();

    await screen.findByText('Tecnologia da Informação');
    expect(screen.queryByRole('link', { name: 'Ver' })).not.toBeInTheDocument();
  });

  it('exports a report as CSV when the export button is clicked', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: makeUser(), isLoading: false, login: vi.fn(), logout: vi.fn() });
    vi.mocked(reportsApi.listReportInstances).mockResolvedValueOnce([makeReportInstance()]);
    vi.mocked(exportApi.exportReportInstance).mockResolvedValueOnce({ blob: new Blob(['a']), filename: 'relatorio.csv' });

    renderDashboard();
    await screen.findByText('Tecnologia da Informação');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /CSV/ }));
    });

    await waitFor(() => expect(exportApi.exportReportInstance).toHaveBeenCalledWith('report-1', 'csv'));
  });
});
