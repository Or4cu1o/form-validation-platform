import { RoleName } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { ReportInstancesController } from './report-instances.controller';
import { ReportInstancesService } from './report-instances.service';

describe('ReportInstancesController', () => {
  let controller: ReportInstancesController;
  let findAllForUserMock: jest.Mock;
  let findOverviewForAllUnitsMock: jest.Mock;
  let findOneForUserMock: jest.Mock;
  let submitForReviewMock: jest.Mock;
  let submitForApprovalMock: jest.Mock;
  let startCurrentPeriodForElaboradorMock: jest.Mock;

  const user: AuthenticatedUser = {
    id: 'elaborador-1',
    matricula: '10002',
    nome: 'Elias',
    sobrenome: 'Elaborador',
    email: 'elaborador@formops.local',
    role: RoleName.ELABORADOR,
    primaryUnitId: 'unit-1',
  };

  beforeEach(() => {
    findAllForUserMock = jest.fn().mockResolvedValue([]);
    findOverviewForAllUnitsMock = jest.fn().mockResolvedValue([]);
    findOneForUserMock = jest.fn().mockResolvedValue({ id: 'report-1' });
    submitForReviewMock = jest.fn().mockResolvedValue({ id: 'report-1' });
    submitForApprovalMock = jest.fn().mockResolvedValue({ id: 'report-1' });
    startCurrentPeriodForElaboradorMock = jest.fn().mockResolvedValue({ id: 'report-new' });
    const reportInstancesService = {
      findAllForUser: findAllForUserMock,
      findOverviewForAllUnits: findOverviewForAllUnitsMock,
      findOneForUser: findOneForUserMock,
      submitForReview: submitForReviewMock,
      submitForApproval: submitForApprovalMock,
      startCurrentPeriodForElaborador: startCurrentPeriodForElaboradorMock,
    } as unknown as ReportInstancesService;
    controller = new ReportInstancesController(reportInstancesService);
  });

  test('findAll delegates to ReportInstancesService.findAllForUser with user and query', async () => {
    const query = { status: undefined };

    await controller.findAll(user, query);

    expect(findAllForUserMock).toHaveBeenCalledWith(user, query);
  });

  test('findOverview delegates to ReportInstancesService.findOverviewForAllUnits with the query', async () => {
    const query = { status: undefined };

    await controller.findOverview(query);

    expect(findOverviewForAllUnitsMock).toHaveBeenCalledWith(query);
  });

  test('findOne delegates to ReportInstancesService.findOneForUser with id and user', async () => {
    await controller.findOne('report-1', user);

    expect(findOneForUserMock).toHaveBeenCalledWith('report-1', user);
  });

  test('submitForReview delegates to ReportInstancesService.submitForReview with id and user', async () => {
    await controller.submitForReview('report-1', user);

    expect(submitForReviewMock).toHaveBeenCalledWith('report-1', user);
  });

  test('submitForApproval delegates to ReportInstancesService.submitForApproval with id and user', async () => {
    await controller.submitForApproval('report-1', user);

    expect(submitForApprovalMock).toHaveBeenCalledWith('report-1', user);
  });

  test('startCurrent delegates to ReportInstancesService.startCurrentPeriodForElaborador with user', async () => {
    await controller.startCurrent(user);

    expect(startCurrentPeriodForElaboradorMock).toHaveBeenCalledWith(user);
  });
});
