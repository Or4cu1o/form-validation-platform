import { describe, expect, it } from 'vitest';
import { ApiError } from './api-error';

describe('ApiError', () => {
  it('carries status and message and behaves as an Error', () => {
    const error = new ApiError(404, 'Não encontrado');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Não encontrado');
  });
});
