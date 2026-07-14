import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './AppShell';
import * as AuthContextModule from '../context/AuthContext';
import type { AuthenticatedUser } from '../types/api';

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../context/AuthContext')>('../context/AuthContext');
  return { ...actual, useAuth: vi.fn() };
});

const baseUser: AuthenticatedUser = {
  id: 'user-1',
  matricula: '001',
  nome: 'Ana',
  sobrenome: 'Silva',
  email: 'ana@example.com',
  role: 'ELABORADOR',
  primaryUnitId: 'unit-1',
};

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<div>Conteúdo</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  it('renders nothing when there is no authenticated user', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: null, isLoading: false, login: vi.fn(), logout: vi.fn() });
    const { container } = renderShell();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows only the nav items allowed for an ELABORADOR', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: baseUser, isLoading: false, login: vi.fn(), logout: vi.fn() });
    renderShell();

    expect(screen.getByRole('link', { name: /Painel Central/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Elaboração e Revisão/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mesa de Validação/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Controle de Acesso/ })).not.toBeInTheDocument();
  });

  it('shows all nav items for an ADMINISTRADOR', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { ...baseUser, role: 'ADMINISTRADOR' },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderShell();

    expect(screen.getByRole('link', { name: /Mesa de Validação/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Controle de Acesso/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Formulários/ })).toBeInTheDocument();
  });

  it('renders the user name and role, and logs out on click', () => {
    const logout = vi.fn();
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ user: baseUser, isLoading: false, login: vi.fn(), logout });
    renderShell();

    expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    expect(screen.getByText('Elaborador')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Sair/ }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
