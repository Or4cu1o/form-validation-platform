import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import * as AuthContextModule from '../context/AuthContext';
import { ApiError } from '../lib/api-error';
import type { AuthenticatedUser } from '../types/api';

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('../context/AuthContext')>('../context/AuthContext');
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

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Painel central</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to / when a user is already authenticated', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderLoginPage();
    expect(screen.getByText('Painel central')).toBeInTheDocument();
  });

  it('shows a validation error when submitting empty fields', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Informe matrícula (ou e-mail) e senha.');
  });

  it('calls login with trimmed credentials and navigates on success', async () => {
    const login = vi.fn().mockResolvedValueOnce(undefined);
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login,
      logout: vi.fn(),
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/Matrícula ou e-mail/), { target: { value: '  001  ' } });
    fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: 'senha-forte' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    });

    expect(login).toHaveBeenCalledWith('001', 'senha-forte');
  });

  it('shows the ApiError message when login fails with a known error', async () => {
    const login = vi.fn().mockRejectedValueOnce(new ApiError(401, 'Credenciais inválidas.'));
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login,
      logout: vi.fn(),
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/Matrícula ou e-mail/), { target: { value: '001' } });
    fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: 'senha-errada' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas.'));
  });

  it('shows a generic error message for unknown failures', async () => {
    const login = vi.fn().mockRejectedValueOnce(new Error('network down'));
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login,
      logout: vi.fn(),
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/Matrícula ou e-mail/), { target: { value: '001' } });
    fireEvent.change(screen.getByLabelText(/^Senha/), { target: { value: 'senha' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível entrar. Tente novamente.'),
    );
  });
});
