import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreTrendChart } from './ScoreTrendChart';

describe('ScoreTrendChart', () => {
  it('shows an empty message when there is no scored month', () => {
    render(<ScoreTrendChart points={[{ label: 'jan', value: null }, { label: 'fev', value: null }]} />);

    expect(screen.getByText('Sem histórico de notas nos últimos meses.')).toBeInTheDocument();
  });

  it('shows the latest score and the delta against the first scored month', () => {
    render(
      <ScoreTrendChart
        points={[
          { label: 'jan', value: 6 },
          { label: 'fev', value: null },
          { label: 'mar', value: 8 },
        ]}
      />,
    );

    expect(screen.getByText('8.0')).toBeInTheDocument();
    expect(screen.getByText('2.0')).toBeInTheDocument();
  });

  it('renders an accessible label describing the trend', () => {
    render(
      <ScoreTrendChart
        points={[
          { label: 'jan', value: 8 },
          { label: 'fev', value: 5 },
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: /de 8.0 para 5.0/ })).toBeInTheDocument();
  });
});
