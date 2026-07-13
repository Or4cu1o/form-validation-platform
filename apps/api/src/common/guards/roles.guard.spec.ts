import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function buildContext(user: { role: RoleName } | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  test('allows access when the route declares no required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext({ role: RoleName.ELABORADOR });

    expect(guard.canActivate(context)).toBe(true);
  });

  test('allows access when the user role is in the required roles list', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.APROVADOR, RoleName.ADMINISTRADOR]);
    const context = buildContext({ role: RoleName.APROVADOR });

    expect(guard.canActivate(context)).toBe(true);
  });

  test('throws ForbiddenException when the user role is not in the required roles list', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleName.ADMINISTRADOR]);
    const context = buildContext({ role: RoleName.OBSERVADOR });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
