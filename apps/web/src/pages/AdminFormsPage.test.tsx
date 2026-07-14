import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { AdminFormsPage } from './AdminFormsPage';
import { renderWithProviders } from '../test/render-with-providers';
import * as formsApi from '../api/forms';
import * as exportApi from '../api/export';
import type { FormTemplate } from '../types/api';

vi.mock('../api/forms');
vi.mock('../api/export');

const template: FormTemplate = {
  id: 'template-1',
  name: 'Formulário Mensal',
  description: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  topics: [],
};

describe('AdminFormsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a placeholder until a template is selected, then loads its detail', async () => {
    vi.mocked(formsApi.listFormTemplates).mockResolvedValueOnce([template]);
    vi.mocked(formsApi.getFormTemplate).mockResolvedValueOnce(template);
    vi.mocked(exportApi.getExportSettings).mockResolvedValueOnce({
      id: 'settings-1',
      exportNamingPattern: '{SIGLA UNIDADE} - {data iso}',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    renderWithProviders(<AdminFormsPage />);

    expect(await screen.findByText('Selecione um formulário')).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Formulário Mensal' }));

    expect(await screen.findByText('Sem tópicos')).toBeInTheDocument();
  });
});
