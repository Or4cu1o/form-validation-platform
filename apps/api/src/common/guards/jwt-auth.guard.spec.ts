import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

function buildContext(): ExecutionContext {
  return { getHandler: () => ({}), getClass: () => ({}) } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let reflector: Reflector;
  let guard: JwtAuthGuard;
  let superCanActivateSpy: jest.SpyInstance;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
    superCanActivateSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);
  });

  afterEach(() => {
    superCanActivateSpy.mockRestore();
  });

  test('bypasses JWT validation when the route is marked @Public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    expect(guard.canActivate(buildContext())).toBe(true);
    expect(superCanActivateSpy).not.toHaveBeenCalled();
  });

  test('delegates to the passport JWT strategy when the route is not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    expect(guard.canActivate(buildContext())).toBe(true);
    expect(superCanActivateSpy).toHaveBeenCalled();
  });
});
