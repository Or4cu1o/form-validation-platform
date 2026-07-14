import { apiGet, apiSend } from '../lib/api-client';
import type { AuthenticatedUser, LoginResponse } from '../types/api';

export function login(identifier: string, password: string): Promise<LoginResponse> {
  return apiSend<LoginResponse>('POST', '/auth/login', { identifier, password });
}

export function fetchCurrentUser(): Promise<AuthenticatedUser> {
  return apiGet<AuthenticatedUser>('/auth/me');
}
