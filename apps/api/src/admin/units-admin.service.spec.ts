import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, UnitLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UnitsAdminService } from './units-admin.service';

function buildUniqueConstraintError(target: string[]): Prisma.PrismaClientKnownRequestError {
  return Object.assign(Object.create(Prisma.PrismaClientKnownRequestError.prototype), {
    code: 'P2002',
    meta: { target },
    message: 'Unique constraint failed',
  });
}

describe('UnitsAdminService', () => {
  let service: UnitsAdminService;
  let findManyMock: jest.Mock;
  let findUniqueMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;

  beforeEach(() => {
    findManyMock = jest.fn();
    findUniqueMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();
    const prisma = {
      unit: { findMany: findManyMock, findUnique: findUniqueMock, create: createMock, update: updateMock },
    } as unknown as PrismaService;
    service = new UnitsAdminService(prisma);
  });

  test('findAll filters by isActive unless includeInactive is set', async () => {
    await service.findAll(false);
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true }, orderBy: { sigla: 'asc' } }),
    );

    await service.findAll(true);
    expect(findManyMock).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
  });

  describe('findOne', () => {
    test('throws NotFoundException when the unit does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    test('returns the unit when found', async () => {
      const unit = { id: 'unit-1' };
      findUniqueMock.mockResolvedValue(unit);

      await expect(service.findOne('unit-1')).resolves.toBe(unit);
    });
  });

  describe('create', () => {
    test('translates a duplicate sigla into ConflictException', async () => {
      createMock.mockRejectedValue(buildUniqueConstraintError(['sigla']));

      await expect(service.create({ sigla: 'FIL01', nome: 'Filial Um', level: UnitLevel.B })).rejects.toThrow(
        ConflictException,
      );
    });

    test('creates the unit when the sigla is unique', async () => {
      const dto = { sigla: 'FIL02', nome: 'Filial Dois', level: UnitLevel.B };
      createMock.mockResolvedValue({ id: 'unit-2', ...dto });

      await service.create(dto);

      expect(createMock).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('update', () => {
    test('throws NotFoundException when the unit does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.update('missing', { nome: 'X' })).rejects.toThrow(NotFoundException);
    });

    test('translates a duplicate sigla into ConflictException on update', async () => {
      findUniqueMock.mockResolvedValue({ id: 'unit-1' });
      updateMock.mockRejectedValue(buildUniqueConstraintError(['sigla']));

      await expect(service.update('unit-1', { sigla: 'DUPLICADA' })).rejects.toThrow(ConflictException);
    });
  });

  describe('setActive', () => {
    test('throws NotFoundException when the unit does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(service.setActive('missing', false)).rejects.toThrow(NotFoundException);
    });

    test('flips the isActive flag for an existing unit', async () => {
      findUniqueMock.mockResolvedValue({ id: 'unit-1' });

      await service.setActive('unit-1', false);

      expect(updateMock).toHaveBeenCalledWith({ where: { id: 'unit-1' }, data: { isActive: false } });
    });
  });
});
