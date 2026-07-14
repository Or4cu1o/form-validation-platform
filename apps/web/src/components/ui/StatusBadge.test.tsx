import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the given label', () => {
    render(<StatusBadge tone="concluido" label="Concluído" />);
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('applies the tone-specific class for each tone', () => {
    const { container, rerender } = render(<StatusBadge tone="reprovado" label="Reprovado" />);
    expect(container.querySelector('span')?.className).toContain('bg-status-reprovado');

    rerender(<StatusBadge tone="pendente" label="Pendente" />);
    expect(container.querySelector('span')?.className).toContain('bg-status-pendente');
  });
});
