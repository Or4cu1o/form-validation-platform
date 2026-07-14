import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { UNAUTHORIZED_EVENT } from '../lib/api-client';
import { clearStoredToken, getStoredToken, setStoredToken } from '../lib/token-storage';
import * as authApi from '../api/auth';
import type { AuthenticatedUser } from '../types/api';

vi.mock('../api/auth');

const mockUser: AuthenticatedUser = {
  id: 'user-1',
  matricula: '001',
  nome: 'Ana',
  sobrenome: 'Silva',
  email: 'ana@example.com',
  role: 'ELABORADOR',
  primaryUnitId: 'unit-1',
};

function Consumer() {
  const { user, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.nome : 'anon'}</span>
      <button onClick={() => login('001', 'senha')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    clearStoredToken();
  });

  afterEach(() => {
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('throws when useAuth is called outside an AuthProvider', () => {
    const BareConsumer = () => {
      useAuth();
      return null;
    };
    expect(() => render(<BareConsumer />)).toThrow('useAuth deve ser usado dentro de um AuthProvider');
  });

  it('starts with isLoading=false and no user when there is no stored token', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('anon');
  });

  it('fetches the current user when a token is already stored', async () => {
    setStoredToken('existing-token');
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('Ana');
  });

  it('clears the token when fetching the current user fails', async () => {
    setStoredToken('stale-token');
    vi.mocked(authApi.fetchCurrentUser).mockRejectedValueOnce(new Error('unauthorized'));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(getStoredToken()).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('anon');
  });

  it('login stores the token and sets the user', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({ accessToken: 'new-token', user: mockUser });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText('login'));
    });

    expect(getStoredToken()).toBe('new-token');
    expect(screen.getByTestId('user').textContent).toBe('Ana');
  });

  it('logout clears the token and the user', async () => {
    setStoredToken('existing-token');
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Ana'));

    fireEvent.click(screen.getByText('logout'));

    expect(getStoredToken()).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('anon');
  });

  it('logs out automatically when an UNAUTHORIZED_EVENT is dispatched', async () => {
    setStoredToken('existing-token');
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Ana'));

    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    });

    expect(screen.getByTestId('user').textContent).toBe('anon');
    expect(getStoredToken()).toBeNull();
  });
});
