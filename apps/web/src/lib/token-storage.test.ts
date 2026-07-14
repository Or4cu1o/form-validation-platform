import { afterEach, describe, expect, it } from 'vitest';
import { clearStoredToken, getStoredToken, setStoredToken } from './token-storage';

describe('token-storage', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('returns null when no token is stored', () => {
    expect(getStoredToken()).toBeNull();
  });

  it('persists a token to sessionStorage and reads it back', () => {
    setStoredToken('abc.def.ghi');
    expect(getStoredToken()).toBe('abc.def.ghi');
  });

  it('clears the stored token', () => {
    setStoredToken('abc.def.ghi');
    clearStoredToken();
    expect(getStoredToken()).toBeNull();
  });

  it('does not use localStorage', () => {
    setStoredToken('abc.def.ghi');
    expect(localStorage.getItem('rtio.accessToken')).toBeNull();
  });
});
