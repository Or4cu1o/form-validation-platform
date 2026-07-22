import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressMeter } from './ProgressMeter';

describe('ProgressMeter', () => {
  it('renders nothing when total is zero', () => {
    const { container } = render(<ProgressMeter segments={[]} total={0} label="indicadores preenchidos" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the completed/total count and an accessible breakdown by segment', () => {
    render(
      <ProgressMeter
        segments={[
          { key: 'conforme', count: 3, label: 'dentro da meta', toneClassName: 'bg-status-concluido' },
          { key: 'fora-meta', count: 1, label: 'fora da meta', toneClassName: 'bg-status-reprovado' },
        ]}
        total={5}
        label="indicadores preenchidos"
      />,
    );

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/de/)).toBeInTheDocument();
    expect(screen.getByText(/5 indicadores preenchidos/)).toBeInTheDocument();

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute(
      'aria-label',
      '4 de 5 indicadores preenchidos (3 dentro da meta, 1 fora da meta)',
    );
  });

  it('marks the count as complete when every item has a segment', () => {
    render(
      <ProgressMeter
        segments={[{ key: 'aprovado', count: 2, label: 'aprovados', toneClassName: 'bg-status-concluido' }]}
        total={2}
        label="indicadores validados"
      />,
    );

    expect(screen.getByText('2')).toHaveClass('text-status-concluido');
  });

  it('ignores zero-count segments when building the accessible breakdown', () => {
    render(
      <ProgressMeter
        segments={[
          { key: 'aprovado', count: 1, label: 'aprovados', toneClassName: 'bg-status-concluido' },
          { key: 'reprovado', count: 0, label: 'reprovados', toneClassName: 'bg-status-reprovado' },
        ]}
        total={3}
        label="indicadores validados"
      />,
    );

    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      '1 de 3 indicadores validados (1 aprovados)',
    );
  });
});
