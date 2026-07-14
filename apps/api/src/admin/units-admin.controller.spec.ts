import { UnitLevel } from '@prisma/client';
import { UnitsAdminController } from './units-admin.controller';
import { UnitsAdminService } from './units-admin.service';

describe('UnitsAdminController', () => {
  let controller: UnitsAdminController;
  let findAllMock: jest.Mock;
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let setActiveMock: jest.Mock;

  beforeEach(() => {
    findAllMock = jest.fn().mockResolvedValue([]);
    findOneMock = jest.fn().mockResolvedValue({ id: 'unit-1' });
    createMock = jest.fn().mockResolvedValue({ id: 'unit-1' });
    updateMock = jest.fn().mockResolvedValue({ id: 'unit-1' });
    setActiveMock = jest.fn().mockResolvedValue({ id: 'unit-1' });
    const unitsAdminService = {
      findAll: findAllMock,
      findOne: findOneMock,
      create: createMock,
      update: updateMock,
      setActive: setActiveMock,
    } as unknown as UnitsAdminService;
    controller = new UnitsAdminController(unitsAdminService);
  });

  test('findAll treats the includeInactive query param as boolean "true" only', async () => {
    await controller.findAll('true');
    expect(findAllMock).toHaveBeenCalledWith(true);

    await controller.findAll(undefined);
    expect(findAllMock).toHaveBeenCalledWith(false);
  });

  test('findOne delegates to UnitsAdminService.findOne with the id', async () => {
    await controller.findOne('unit-1');

    expect(findOneMock).toHaveBeenCalledWith('unit-1');
  });

  test('create delegates to UnitsAdminService.create with the dto', async () => {
    const dto = { sigla: 'FIL01', nome: 'Filial Um', level: UnitLevel.B };

    await controller.create(dto);

    expect(createMock).toHaveBeenCalledWith(dto);
  });

  test('update delegates to UnitsAdminService.update with the id and dto', async () => {
    await controller.update('unit-1', { nome: 'Novo nome' });

    expect(updateMock).toHaveBeenCalledWith('unit-1', { nome: 'Novo nome' });
  });

  test('deactivate/activate delegate to UnitsAdminService.setActive', async () => {
    await controller.deactivate('unit-1');
    expect(setActiveMock).toHaveBeenCalledWith('unit-1', false);

    await controller.activate('unit-1');
    expect(setActiveMock).toHaveBeenCalledWith('unit-1', true);
  });
});
