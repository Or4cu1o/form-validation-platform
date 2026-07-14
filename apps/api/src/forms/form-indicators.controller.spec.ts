import { GoalOperator } from '@prisma/client';
import { FormIndicatorsController } from './form-indicators.controller';
import { FormIndicatorsService } from './form-indicators.service';

describe('FormIndicatorsController', () => {
  let controller: FormIndicatorsController;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let setActiveMock: jest.Mock;

  const dto = {
    title: 'Chamados: Backlog',
    objective: 'Medir backlog',
    variableKeys: ['CA', 'CB'],
    formulaExpression: '(CB / CA) * 100',
    goalOperator: GoalOperator.LTE,
    goalValue: 5,
  };

  beforeEach(() => {
    createMock = jest.fn().mockResolvedValue({ id: 'indicator-1' });
    updateMock = jest.fn().mockResolvedValue({ id: 'indicator-1' });
    setActiveMock = jest.fn().mockResolvedValue({ id: 'indicator-1' });
    const formIndicatorsService = {
      create: createMock,
      update: updateMock,
      setActive: setActiveMock,
    } as unknown as FormIndicatorsService;
    controller = new FormIndicatorsController(formIndicatorsService);
  });

  test('create delegates to FormIndicatorsService.create with the topic id and dto', async () => {
    await controller.create('topic-1', dto);

    expect(createMock).toHaveBeenCalledWith('topic-1', dto);
  });

  test('update delegates to FormIndicatorsService.update with the id and dto', async () => {
    await controller.update('indicator-1', { goalValue: 10 });

    expect(updateMock).toHaveBeenCalledWith('indicator-1', { goalValue: 10 });
  });

  test('deactivate delegates to FormIndicatorsService.setActive(id, false)', async () => {
    await controller.deactivate('indicator-1');

    expect(setActiveMock).toHaveBeenCalledWith('indicator-1', false);
  });

  test('activate delegates to FormIndicatorsService.setActive(id, true)', async () => {
    await controller.activate('indicator-1');

    expect(setActiveMock).toHaveBeenCalledWith('indicator-1', true);
  });
});
