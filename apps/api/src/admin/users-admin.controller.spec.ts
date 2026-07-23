import { RoleName } from '@prisma/client';
import { UsersAdminController } from './users-admin.controller';
import { UsersAdminService } from './users-admin.service';

describe('UsersAdminController', () => {
  let controller: UsersAdminController;
  let findAllMock: jest.Mock;
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let resetPasswordMock: jest.Mock;
  let setActiveMock: jest.Mock;
  let grantUnitAccessMock: jest.Mock;
  let revokeUnitAccessMock: jest.Mock;

  beforeEach(() => {
    findAllMock = jest.fn().mockResolvedValue([]);
    findOneMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    createMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    updateMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    resetPasswordMock = jest.fn().mockResolvedValue({ success: true });
    setActiveMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    grantUnitAccessMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    revokeUnitAccessMock = jest.fn().mockResolvedValue({ id: 'user-1' });
    const usersAdminService = {
      findAll: findAllMock,
      findOne: findOneMock,
      create: createMock,
      update: updateMock,
      resetPassword: resetPasswordMock,
      setActive: setActiveMock,
      grantUnitAccess: grantUnitAccessMock,
      revokeUnitAccess: revokeUnitAccessMock,
    } as unknown as UsersAdminService;
    controller = new UsersAdminController(usersAdminService);
  });

  test('findAll treats the includeInactive query param as boolean "true" only', async () => {
    await controller.findAll('true');
    expect(findAllMock).toHaveBeenCalledWith(true);

    await controller.findAll(undefined);
    expect(findAllMock).toHaveBeenCalledWith(false);
  });

  test('findOne delegates to UsersAdminService.findOne with the id', async () => {
    await controller.findOne('user-1');

    expect(findOneMock).toHaveBeenCalledWith('user-1');
  });

  test('create delegates to UsersAdminService.create with the dto', async () => {
    const dto = {
      matricula: '10010',
      nome: 'Novo',
      sobrenome: 'Usuario',
      email: 'novo@formops.local',
      password: 'senha-forte-123',
      role: RoleName.ELABORADOR,
      primaryUnitId: 'unit-1',
    };

    await controller.create(dto);

    expect(createMock).toHaveBeenCalledWith(dto);
  });

  test('update delegates to UsersAdminService.update with the id and dto', async () => {
    await controller.update('user-1', { nome: 'Novo nome' });

    expect(updateMock).toHaveBeenCalledWith('user-1', { nome: 'Novo nome' });
  });

  test('resetPassword delegates to UsersAdminService.resetPassword with id and newPassword', async () => {
    await controller.resetPassword('user-1', { newPassword: 'nova-senha-123' });

    expect(resetPasswordMock).toHaveBeenCalledWith('user-1', 'nova-senha-123');
  });

  test('deactivate/activate delegate to UsersAdminService.setActive', async () => {
    await controller.deactivate('user-1');
    expect(setActiveMock).toHaveBeenCalledWith('user-1', false);

    await controller.activate('user-1');
    expect(setActiveMock).toHaveBeenCalledWith('user-1', true);
  });

  test('grantUnitAccess/revokeUnitAccess delegate with id and unitId', async () => {
    await controller.grantUnitAccess('user-1', { unitId: 'unit-2' });
    expect(grantUnitAccessMock).toHaveBeenCalledWith('user-1', 'unit-2');

    await controller.revokeUnitAccess('user-1', { unitId: 'unit-2' });
    expect(revokeUnitAccessMock).toHaveBeenCalledWith('user-1', 'unit-2');
  });
});
