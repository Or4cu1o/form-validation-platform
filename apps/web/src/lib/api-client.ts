import { API_BASE_URL } from './env';
import { ApiError } from './api-error';
import { clearStoredToken, getStoredToken } from './token-storage';
import type { ApiErrorBody } from '../types/api';

export const UNAUTHORIZED_EVENT = 'formops:unauthorized';

function extractMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body) return fallback;
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? fallback;
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody | null> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    clearStoredToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    const body = await parseErrorBody(response);
    throw new ApiError(response.status, extractMessage(body, `Falha na requisicao (${response.status})`));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type QueryValue = string | number | boolean | undefined | null;

export function buildQueryString<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, QueryValue][]) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<T>(response);
}

export async function apiSend<T>(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  return handleResponse<T>(response);
}

export async function apiDownloadBlob(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...authHeaders() },
  });

  if (response.status === 401) {
    clearStoredToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    const body = await parseErrorBody(response);
    throw new ApiError(response.status, extractMessage(body, `Falha na requisicao (${response.status})`));
  }

  const disposition = response.headers.get('content-disposition');
  const filenameMatch = disposition?.match(/filename="?([^";]+)"?/);

  return { blob: await response.blob(), filename: filenameMatch?.[1] ?? null };
}
