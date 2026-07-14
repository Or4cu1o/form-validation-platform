import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleName } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let findActiveByIdMock: jest.Mock;

  const dbUser = {
    id: 'user-1',
    matricula: '10001',
    nome: 'Teste',
    sobrenome: 'Usuario',
    email: 'teste@rtio.local',
    passwordHash: 'hashed-password',
    role: RoleName.ELABORADOR,
    primaryUnitId: 'unit-1',
  };

  beforeEach(() => {
    findActiveByIdMock = jest.fn();
    const configService = { getOrThrow: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService;
    const usersService = { findActiveById: findActiveByIdMock } as unknown as UsersService;
    strategy = new JwtStrategy(configService, usersService);
  });

  test('throws UnauthorizedException when the JWT subject no longer maps to an active user', async () => {
    findActiveByIdMock.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'ghost-user-id', role: RoleName.ELABORADOR, unitId: 'unit-1' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  test('returns the authenticated user without the passwordHash for a valid, active subject', async () => {
    findActiveByIdMock.mockResolvedValue(dbUser);

    const result = await strategy.validate({ sub: dbUser.id, role: dbUser.role, unitId: dbUser.primaryUnitId });

    expect(findActiveByIdMock).toHaveBeenCalledWith(dbUser.id);
    expect(result).toEqual({
      id: dbUser.id,
      matricula: dbUser.matricula,
      nome: dbUser.nome,
      sobrenome: dbUser.sobrenome,
      email: dbUser.email,
      role: dbUser.role,
      primaryUnitId: dbUser.primaryUnitId,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
