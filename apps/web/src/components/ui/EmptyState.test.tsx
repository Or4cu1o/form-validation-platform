import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Nenhum relatório encontrado" />);
    expect(screen.getByText('Nenhum relatório encontrado')).toBeInTheDocument();
  });

  it('renders the description and action when provided', () => {
    render(
      <EmptyState
        title="Nenhum relatório encontrado"
        description="Ajuste os filtros para ver outros períodos."
        action={<button>Limpar filtros</button>}
      />,
    );
    expect(screen.getByText('Ajuste os filtros para ver outros períodos.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });
});
