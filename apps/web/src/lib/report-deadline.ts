import { formatDateTime } from './format';
import type { ReportInstance } from '../types/api';

export function getRelevantDeadline(report: ReportInstance): { label: string; value: string } {
  switch (report.status) {
    case 'PENDENTE':
      return { label: 'Prazo de elaboração', value: formatDateTime(report.elaborationDueDate) };
    case 'EM_REVISAO':
      return report.slaExtensionDueDate
        ? { label: 'Prazo prorrogado', value: formatDateTime(report.slaExtensionDueDate) }
        : { label: 'Prazo de revisão', value: formatDateTime(report.reviewDueDate) };
    case 'PENDENTE_APROVACAO':
      return { label: 'Prazo de aprovação', value: formatDateTime(report.approvalDueDate) };
    case 'CONCLUIDO':
      return { label: 'Concluído em', value: formatDateTime(report.concludedAt) };
    default:
      return { label: '—', value: '—' };
  }
}
