import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { TopicFormModal } from './TopicFormModal';
import { renderWithProviders } from '../../../test/render-with-providers';
import * as formsApi from '../../../api/forms';
import type { FormTopic } from '../../../types/api';

vi.mock('../../../api/forms');

const topic: FormTopic = {
  id: 'topic-1',
  formTemplateId: 'template-1',
  title: 'Infraestrutura',
  order: 0,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TopicFormModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires a title before submitting', () => {
    renderWithProviders(<TopicFormModal isOpen onClose={vi.fn()} templateId="template-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Criar tópico' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o título do tópico.');
    expect(formsApi.createFormTopic).not.toHaveBeenCalled();
  });

  it('creates a topic with the given title and numeric order', async () => {
    vi.mocked(formsApi.createFormTopic).mockResolvedValueOnce(topic);
    const onClose = vi.fn();

    renderWithProviders(<TopicFormModal isOpen onClose={onClose} templateId="template-1" />);
    fireEvent.change(screen.getByLabelText(/^Título/), { target: { value: 'Segurança' } });
    fireEvent.change(screen.getByLabelText('Ordem'), { target: { value: '2' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar tópico' }));
    });

    expect(formsApi.createFormTopic).toHaveBeenCalledWith('template-1', { title: 'Segurança', order: 2 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
