import { ForbiddenException } from '@nestjs/common';
import { ReportInstance, ReportStatus, RoleName } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

// Regra unica de "quem pode editar dados de um relatorio agora" (Secao 4):
// Elaborador edita enquanto PENDENTE, Revisor edita enquanto EM_REVISAO —
// sempre restrito a unidade primaria do usuario. Usada tanto para valores
// de indicador quanto para upload de evidencias.
export function assertCanEditReportData(report: ReportInstance, user: AuthenticatedUser): void {
  if (user.primaryUnitId !== report.unitId) {
    throw new ForbiddenException('Usuario nao pertence a unidade deste relatorio');
  }
  const canElaborate = report.status === ReportStatus.PENDENTE && user.role === RoleName.ELABORADOR;
  const canReview = report.status === ReportStatus.EM_REVISAO && user.role === RoleName.REVISOR;
  if (!canElaborate && !canReview) {
    throw new ForbiddenException('Usuario nao autorizado a editar dados deste relatorio no status atual');
  }
}
