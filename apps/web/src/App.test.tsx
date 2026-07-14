import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  afterEach(() => {
    sessionStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('redirects an unauthenticated visitor to the login screen', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('renders the login form directly when navigating to /login', async () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('renders a 404 page for an unknown route', async () => {
    window.history.pushState({}, '', '/rota-inexistente');
    render(<App />);
    expect(await screen.findByText('404')).toBeInTheDocument();
  });
});
