import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Painel Central" />);
    expect(screen.getByRole('heading', { name: 'Painel Central' })).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<PageHeader title="Painel Central" description="Histórico de relatórios" />);
    expect(screen.getByText('Histórico de relatórios')).toBeInTheDocument();
  });

  it('omits the description paragraph when not provided', () => {
    const { container } = render(<PageHeader title="Painel Central" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('renders the actions node', () => {
    render(<PageHeader title="Painel Central" actions={<button>Exportar</button>} />);
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });
});
