import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';

function renderLayout(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/acessos" element={<div>Conteúdo de Acessos</div>} />
          <Route path="/admin/formularios" element={<div>Conteúdo de Formulários</div>} />
          <Route path="/admin/configuracoes" element={<div>Conteúdo de Configurações</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminLayout', () => {
  it('renders the three section tabs and the active route content', () => {
    renderLayout('/admin/formularios');

    expect(screen.getByRole('link', { name: 'Acessos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Formulários' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Configurações' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo de Formulários')).toBeInTheDocument();
  });

  it('marks the current section tab as active', () => {
    renderLayout('/admin/configuracoes');

    expect(screen.getByRole('link', { name: 'Configurações' })).toHaveClass('border-accent');
    expect(screen.getByRole('link', { name: 'Acessos' })).not.toHaveClass('border-accent');
  });
});
