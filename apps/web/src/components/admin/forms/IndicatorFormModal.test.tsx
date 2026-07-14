import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { IndicatorFormModal } from './IndicatorFormModal';
import { renderWithProviders } from '../../../test/render-with-providers';
import * as formsApi from '../../../api/forms';
import type { FormIndicator } from '../../../types/api';

vi.mock('../../../api/forms');

const indicator: FormIndicator = {
  id: 'indicator-1',
  formTopicId: 'topic-1',
  title: 'Disponibilidade',
  objective: 'Medir uptime',
  variableKeys: ['uptime', 'total'],
  formulaExpression: '(uptime / total) * 100',
  goalOperator: 'GTE',
  goalValue: '99',
  isResidentState: false,
  order: 0,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/^Título/), { target: { value: 'Disponibilidade' } });
  fireEvent.change(screen.getByLabelText(/^Objetivo/), { target: { value: 'Medir uptime' } });
  fireEvent.change(screen.getByLabelText(/Fórmula/), { target: { value: '(uptime / total) * 100' } });
}

describe('IndicatorFormModal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires title, objective and formula before submitting', () => {
    renderWithProviders(<IndicatorFormModal isOpen onClose={vi.fn()} templateId="template-1" topicId="topic-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Criar indicador' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Preencha título, objetivo e fórmula.');
    expect(formsApi.createFormIndicator).not.toHaveBeenCalled();
  });

  it('requires at least one variable key', () => {
    renderWithProviders(<IndicatorFormModal isOpen onClose={vi.fn()} templateId="template-1" topicId="topic-1" />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: 'Criar indicador' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe ao menos uma chave de variável.');
  });

  it('rejects variable keys that do not match the identifier pattern', () => {
    renderWithProviders(<IndicatorFormModal isOpen onClose={vi.fn()} templateId="template-1" topicId="topic-1" />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Chaves de variáveis/), { target: { value: '1invalid, uptime' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar indicador' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Chaves devem começar com letra');
    expect(formsApi.createFormIndicator).not.toHaveBeenCalled();
  });

  it('creates an indicator with parsed variable keys and numeric fields', async () => {
    vi.mocked(formsApi.createFormIndicator).mockResolvedValueOnce(indicator);
    const onClose = vi.fn();

    renderWithProviders(<IndicatorFormModal isOpen onClose={onClose} templateId="template-1" topicId="topic-1" />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Chaves de variáveis/), { target: { value: 'uptime, total' } });
    fireEvent.change(screen.getByLabelText(/^Valor da meta/), { target: { value: '99' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Criar indicador' }));
    });

    expect(formsApi.createFormIndicator).toHaveBeenCalledWith('topic-1', {
      title: 'Disponibilidade',
      objective: 'Medir uptime',
      variableKeys: ['uptime', 'total'],
      formulaExpression: '(uptime / total) * 100',
      goalOperator: 'GTE',
      goalValue: 99,
      isResidentState: false,
      order: 0,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
