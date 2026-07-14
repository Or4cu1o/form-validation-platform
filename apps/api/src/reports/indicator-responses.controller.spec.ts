import { RoleName } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { IndicatorResponsesController } from './indicator-responses.controller';
import { IndicatorResponsesService } from './indicator-responses.service';

describe('IndicatorResponsesController', () => {
  let controller: IndicatorResponsesController;
  let updateValuesMock: jest.Mock;

  const user: AuthenticatedUser = {
    id: 'elaborador-1',
    matricula: '10002',
    nome: 'Elias',
    sobrenome: 'Elaborador',
    email: 'elaborador@rtio.local',
    role: RoleName.ELABORADOR,
    primaryUnitId: 'unit-1',
  };

  beforeEach(() => {
    updateValuesMock = jest.fn().mockResolvedValue({ id: 'response-1' });
    const indicatorResponsesService = { updateValues: updateValuesMock } as unknown as IndicatorResponsesService;
    controller = new IndicatorResponsesController(indicatorResponsesService);
  });

  test('updateValues delegates to IndicatorResponsesService.updateValues with id, dto and user', async () => {
    const dto = { variableValues: { CA: 10 } };

    await controller.updateValues('response-1', dto, user);

    expect(updateValuesMock).toHaveBeenCalledWith('response-1', user, dto);
  });
});
