import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { TemplateFormModal } from './TemplateFormModal';
import { renderWithProviders } from '../../../test/render-with-providers';
import * as formsApi from '../../../api/forms';
import type { FormTemplate } from '../../../types/api';

vi.mock('../../../api/forms');

const template: FormTemplate = {
  id: 'template-1',
  name: 'Formulário Mensal',
  description: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TemplateFormModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires a name before submitting', () => {
    renderWithProviders(<TemplateFormModal isOpen onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Criar formulário' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome do formulário.');
    expect(formsApi.createFormTemplate).not.toHaveBeenCalled();
  });

  it('creates a template with the given name', async () => {
    vi.mocked(formsApi.createFormTemplate).mockResolvedValueOnce(template);
    const onClose = vi.fn();

    renderWithProviders(<TemplateFormModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/^Nome/), { target: { value: 'Formulário Trimestral' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar formulário' }));
    });

    expect(formsApi.createFormTemplate).toHaveBeenCalledWith({ name: 'Formulário Trimestral', description: undefined });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
