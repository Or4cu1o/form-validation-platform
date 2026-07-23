import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { IndicatorScorePanel } from './IndicatorScorePanel';
import { renderWithProviders } from '../../../test/render-with-providers';
import * as formsApi from '../../../api/forms';

vi.mock('../../../api/forms');

describe('IndicatorScorePanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when the template has no active indicators', async () => {
    vi.mocked(formsApi.getIndicatorScores).mockResolvedValueOnce({ items: [], sum: 0, target: 10 });

    const { container } = renderWithProviders(<IndicatorScorePanel templateId="template-1" />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('shows the sum in red and disables save when weights do not add up to 10', async () => {
    vi.mocked(formsApi.getIndicatorScores).mockResolvedValueOnce({
      items: [
        { id: 'ind-1', title: 'Indicador A', scoreWeight: 3 },
        { id: 'ind-2', title: 'Indicador B', scoreWeight: 3 },
      ],
      sum: 6,
      target: 10,
    });

    renderWithProviders(<IndicatorScorePanel templateId="template-1" />);

    expect(await screen.findByText('Soma: 6.00 / 10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar pontuação' })).toBeDisabled();
  });

  it('enables save and persists the edited weights once they sum to 10', async () => {
    vi.mocked(formsApi.getIndicatorScores).mockResolvedValueOnce({
      items: [
        { id: 'ind-1', title: 'Indicador A', scoreWeight: 3 },
        { id: 'ind-2', title: 'Indicador B', scoreWeight: 3 },
      ],
      sum: 6,
      target: 10,
    });
    vi.mocked(formsApi.getIndicatorScores).mockResolvedValueOnce({
      items: [
        { id: 'ind-1', title: 'Indicador A', scoreWeight: 7 },
        { id: 'ind-2', title: 'Indicador B', scoreWeight: 3 },
      ],
      sum: 10,
      target: 10,
    });
    vi.mocked(formsApi.updateIndicatorScores).mockResolvedValueOnce({
      items: [
        { id: 'ind-1', title: 'Indicador A', scoreWeight: 7 },
        { id: 'ind-2', title: 'Indicador B', scoreWeight: 3 },
      ],
      sum: 10,
      target: 10,
    });

    renderWithProviders(<IndicatorScorePanel templateId="template-1" />);
    await screen.findByText('Indicador A');

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '7' } });

    expect(await screen.findByText('Soma: 10.00 / 10')).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: 'Salvar pontuação' });
    expect(saveButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(formsApi.updateIndicatorScores).toHaveBeenCalledWith('template-1', [
      { indicatorId: 'ind-1', scoreWeight: 7 },
      { indicatorId: 'ind-2', scoreWeight: 3 },
    ]);
  });

  it('distributes weights evenly when the button is clicked', async () => {
    vi.mocked(formsApi.getIndicatorScores).mockResolvedValueOnce({
      items: [
        { id: 'ind-1', title: 'Indicador A', scoreWeight: 3 },
        { id: 'ind-2', title: 'Indicador B', scoreWeight: 7 },
      ],
      sum: 10,
      target: 10,
    });
    vi.mocked(formsApi.getIndicatorScores).mockResolvedValueOnce({
      items: [
        { id: 'ind-1', title: 'Indicador A', scoreWeight: 5 },
        { id: 'ind-2', title: 'Indicador B', scoreWeight: 5 },
      ],
      sum: 10,
      target: 10,
    });
    vi.mocked(formsApi.distributeIndicatorScores).mockResolvedValueOnce({
      items: [
        { id: 'ind-1', title: 'Indicador A', scoreWeight: 5 },
        { id: 'ind-2', title: 'Indicador B', scoreWeight: 5 },
      ],
      sum: 10,
      target: 10,
    });

    renderWithProviders(<IndicatorScorePanel templateId="template-1" />);
    await screen.findByText('Indicador A');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Distribuir igualmente' }));
    });

    expect(formsApi.distributeIndicatorScores).toHaveBeenCalledWith('template-1');
  });
});
