import { ForbiddenException } from '@nestjs/common';
import { ReportInstance, ReportStatus, RoleName } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { assertCanEditReportData } from './report-edit-access.util';

describe('assertCanEditReportData', () => {
  const report = { id: 'report-1', unitId: 'unit-1', status: ReportStatus.PENDENTE } as ReportInstance;

  function buildUser(role: RoleName, primaryUnitId = 'unit-1'): AuthenticatedUser {
    return { id: 'user-1', matricula: '1', nome: 'A', sobrenome: 'B', email: 'a@formops.local', role, primaryUnitId };
  }

  test('throws when the user does not belong to the report unit', () => {
    expect(() => assertCanEditReportData(report, buildUser(RoleName.ELABORADOR, 'other-unit'))).toThrow(
      ForbiddenException,
    );
  });

  test('allows ELABORADOR to edit while the report is PENDENTE', () => {
    expect(() => assertCanEditReportData(report, buildUser(RoleName.ELABORADOR))).not.toThrow();
  });

  test('blocks ELABORADOR from editing once the report has left PENDENTE', () => {
    const emRevisao = { ...report, status: ReportStatus.EM_REVISAO } as ReportInstance;
    expect(() => assertCanEditReportData(emRevisao, buildUser(RoleName.ELABORADOR))).toThrow(ForbiddenException);
  });

  test('allows REVISOR to edit while the report is EM_REVISAO', () => {
    const emRevisao = { ...report, status: ReportStatus.EM_REVISAO } as ReportInstance;
    expect(() => assertCanEditReportData(emRevisao, buildUser(RoleName.REVISOR))).not.toThrow();
  });

  test('blocks REVISOR from editing while the report is still PENDENTE', () => {
    expect(() => assertCanEditReportData(report, buildUser(RoleName.REVISOR))).toThrow(ForbiddenException);
  });

  test('blocks roles outside ELABORADOR/REVISOR entirely, regardless of status', () => {
    expect(() => assertCanEditReportData(report, buildUser(RoleName.APROVADOR))).toThrow(ForbiddenException);
  });
});
