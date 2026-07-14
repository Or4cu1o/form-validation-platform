import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersAdminService } from './users-admin.service';

jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed-password') }));
const hashMock = bcrypt.hash as unknown as jest.Mock;

function buildUniqueConstraintError(target: string[]): Prisma.PrismaClientKnownRequestError {
  return Object.assign(Object.create(Prisma.PrismaClientKnownRequestError.prototype), {
    code: 'P2002',
    meta: { target },
    message: 'Unique constraint failed',
  });
}

describe('UsersAdminService', () => {
  let service: UsersAdminService;
  let findManyMock: jest.Mock;
  let findUniqueMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let createUnitAccessMock: jest.Mock;
  let deleteManyUnitAccessMock: jest.Mock;

  const createDto = {
    matricula: '10010',
    nome: 'Novo',
    sobrenome: 'Usuario',
    email: 'novo@rtio.local',
    password: 'senha-forte-123',
    role: RoleName.ELABORADOR,
    primaryUnitId: 'unit-1',
  };

  beforeEach(() => {
    findManyMock = jest.fn();
    findUniqueMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();
    createUnitAccessMock = jest.fn();
    deleteManyUnitAccessMock = jest.fn();
    const prisma = {
      user: { findMany: findManyMock, findUnique: findUniqueMock, create: createMock, update: updateMock },
      userUnitAccess: { create: createUnitAccessMock, deleteMany: deleteManyUnitAccessMock },
    } as unknown as PrismaService;
    service = new UsersAdminService(prisma);
  });

  describe('create', () => {
    test('hashes the password before persisting and attaches extra unit accesses', async () => {
      createMock.mockResolvedValue({ id: 'user-new' });

      await service.create({ ...createDto, extraUnitIds: ['unit-2', 'unit-3'] });

      expect(hashMock).toHaveBeenCalledWith(createDto.password, 10);
      const callArgs = createMock.mock.calls[0][0];
      expect(callArgs.data.passwordHash).toBe('hashed-password');
      expect(callArgs.data.password).toBeUndefined();
      expect(callArgs.data.unitAccesses).toEqual({
        create: [{ unitId: 'unit-2' }, { unitId: 'unit-3' }],
      });
    });

    test('translates a duplicate matricula/email into ConflictException', async () => {
      createMock.mockRejectedValue(buildUniqueConstraintError(['matricula']));

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    test('throws NotFoundException when the user does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.update('missing', { nome: 'X' })).rejects.toThrow(NotFoundException);
    });

    test('translates a duplicate email into ConflictException on update', async () => {
      findUniqueMock.mockResolvedValue({ id: 'user-1' });
      updateMock.mockRejectedValue(buildUniqueConstraintError(['email']));

      await expect(service.update('user-1', { email: 'duplicado@rtio.local' })).rejects.toThrow(ConflictException);
    });
  });

  describe('resetPassword', () => {
    test('throws NotFoundException when the user does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.resetPassword('missing', 'nova-senha')).rejects.toThrow(NotFoundException);
    });

    test('hashes and persists the new password for an existing user', async () => {
      findUniqueMock.mockResolvedValue({ id: 'user-1' });

      const result = await service.resetPassword('user-1', 'nova-senha-123');

      expect(hashMock).toHaveBeenCalledWith('nova-senha-123', 10);
      expect(updateMock).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { passwordHash: 'hashed-password' } });
      expect(result).toEqual({ success: true });
    });
  });

  describe('grantUnitAccess', () => {
    test('throws NotFoundException when the user does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.grantUnitAccess('missing', 'unit-2')).rejects.toThrow(NotFoundException);
    });

    test('throws ConflictException when the user already has access to the unit', async () => {
      findUniqueMock.mockResolvedValue({ id: 'user-1' });
      createUnitAccessMock.mockRejectedValue(buildUniqueConstraintError(['userId', 'unitId']));

      await expect(service.grantUnitAccess('user-1', 'unit-2')).rejects.toThrow(ConflictException);
    });

    test('grants access and returns the refreshed user', async () => {
      findUniqueMock.mockResolvedValueOnce({ id: 'user-1' }).mockResolvedValueOnce({ id: 'user-1' });

      await service.grantUnitAccess('user-1', 'unit-2');

      expect(createUnitAccessMock).toHaveBeenCalledWith({ data: { userId: 'user-1', unitId: 'unit-2' } });
    });
  });

  describe('revokeUnitAccess', () => {
    test('throws NotFoundException when the user does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.revokeUnitAccess('missing', 'unit-2')).rejects.toThrow(NotFoundException);
    });

    test('removes the unit access grant for an existing user', async () => {
      findUniqueMock.mockResolvedValue({ id: 'user-1' });

      await service.revokeUnitAccess('user-1', 'unit-2');

      expect(deleteManyUnitAccessMock).toHaveBeenCalledWith({ where: { userId: 'user-1', unitId: 'unit-2' } });
    });
  });
});
