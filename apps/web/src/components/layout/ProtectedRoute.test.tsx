import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthContextModule from '../../context/AuthContext';
import type { AuthenticatedUser } from '../../types/api';

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../../context/AuthContext')>('../../context/AuthContext');
  return { ...actual, useAuth: vi.fn() };
});

const mockUser: AuthenticatedUser = {
  id: 'user-1',
  matricula: '001',
  nome: 'Ana',
  sobrenome: 'Silva',
  email: 'ana@example.com',
  role: 'ELABORADOR',
  primaryUnitId: 'unit-1',
};

function renderWithRoute(initialPath = '/protegida') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Tela de login</div>} />
        <Route path="/" element={<div>Painel central</div>} />
        <Route element={<ProtectedRoute allowedRoles={['ELABORADOR']} />}>
          <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a spinner while the session is loading', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRoute();
    expect(screen.getByText('Verificando sessão...')).toBeInTheDocument();
  });

  it('redirects to /login when there is no authenticated user', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRoute();
    expect(screen.getByText('Tela de login')).toBeInTheDocument();
  });

  it('redirects to / when the user role is not allowed', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { ...mockUser, role: 'OBSERVADOR' },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRoute();
    expect(screen.getByText('Painel central')).toBeInTheDocument();
  });

  it('renders the protected content when the role is allowed', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRoute();
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });
});
