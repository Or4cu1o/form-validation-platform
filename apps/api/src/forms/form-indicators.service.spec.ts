import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GoalOperator } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FormIndicatorsService } from './form-indicators.service';

describe('FormIndicatorsService', () => {
  let service: FormIndicatorsService;
  let findUniqueTopicMock: jest.Mock;
  let createMock: jest.Mock;
  let findUniqueIndicatorMock: jest.Mock;
  let updateMock: jest.Mock;

  const validDto = {
    title: 'Chamados: Backlog',
    objective: 'Medir backlog',
    variableKeys: ['CA', 'CB'],
    formulaExpression: '(CB / CA) * 100',
    goalOperator: GoalOperator.LTE,
    goalValue: 5,
  };

  beforeEach(() => {
    findUniqueTopicMock = jest.fn();
    createMock = jest.fn();
    findUniqueIndicatorMock = jest.fn();
    updateMock = jest.fn();
    const prisma = {
      formTopic: { findUnique: findUniqueTopicMock },
      formIndicator: { create: createMock, findUnique: findUniqueIndicatorMock, update: updateMock },
    } as unknown as PrismaService;
    service = new FormIndicatorsService(prisma);
  });

  describe('create', () => {
    test('throws NotFoundException when the parent topic does not exist', async () => {
      findUniqueTopicMock.mockResolvedValue(null);

      await expect(service.create('missing-topic', validDto)).rejects.toThrow(NotFoundException);
    });

    test('throws BadRequestException when the formula references an undeclared variable', async () => {
      findUniqueTopicMock.mockResolvedValue({ id: 'topic-1' });

      await expect(
        service.create('topic-1', { ...validDto, formulaExpression: '(CB / UNDECLARED) * 100' }),
      ).rejects.toThrow(BadRequestException);
      expect(createMock).not.toHaveBeenCalled();
    });

    test('creates the indicator under an existing topic when the formula is valid', async () => {
      findUniqueTopicMock.mockResolvedValue({ id: 'topic-1' });

      await service.create('topic-1', validDto);

      expect(createMock).toHaveBeenCalledWith({ data: { ...validDto, formTopicId: 'topic-1' } });
    });
  });

  describe('update', () => {
    test('throws NotFoundException when the indicator does not exist', async () => {
      findUniqueIndicatorMock.mockResolvedValue(null);

      await expect(service.update('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
    });

    test('re-validates the merged formula/variableKeys before persisting a partial update', async () => {
      findUniqueIndicatorMock.mockResolvedValue({
        id: 'indicator-1',
        variableKeys: validDto.variableKeys,
        formulaExpression: validDto.formulaExpression,
      });

      await expect(service.update('indicator-1', { variableKeys: ['CA'] })).rejects.toThrow(BadRequestException);
      expect(updateMock).not.toHaveBeenCalled();
    });

    test('updates the indicator when the resulting formula/variableKeys remain valid', async () => {
      findUniqueIndicatorMock.mockResolvedValue({
        id: 'indicator-1',
        variableKeys: validDto.variableKeys,
        formulaExpression: validDto.formulaExpression,
      });

      await service.update('indicator-1', { goalValue: 10 });

      expect(updateMock).toHaveBeenCalledWith({ where: { id: 'indicator-1' }, data: { goalValue: 10 } });
    });
  });

  describe('setActive', () => {
    test('throws NotFoundException when the indicator does not exist', async () => {
      findUniqueIndicatorMock.mockResolvedValue(null);

      await expect(service.setActive('missing', false)).rejects.toThrow(NotFoundException);
    });

    test('flips the isActive flag for an existing indicator', async () => {
      findUniqueIndicatorMock.mockResolvedValue({ id: 'indicator-1' });

      await service.setActive('indicator-1', false);

      expect(updateMock).toHaveBeenCalledWith({ where: { id: 'indicator-1' }, data: { isActive: false } });
    });
  });
});
