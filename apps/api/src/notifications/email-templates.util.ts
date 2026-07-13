import { ReportInstance, Unit } from '@prisma/client';

export interface EmailContent {
  subject: string;
  html: string;
}

function periodoLabel(referenceMonth: Date): string {
  return referenceMonth.toISOString().slice(0, 7);
}

function wrapHtml(title: string, bodyLines: string[]): string {
  const body = bodyLines.map((line) => `<p>${line}</p>`).join('\n');
  return `<h2>${title}</h2>\n${body}`;
}

export function buildSlaOverdueEmail(report: ReportInstance, unit: Unit): EmailContent {
  return {
    subject: `[RTIO] SLA estourado — ${unit.sigla} (${periodoLabel(report.referenceMonth)})`,
    html: wrapHtml('Estouro de SLA de elaboracao', [
      `O relatorio da unidade <strong>${unit.sigla} - ${unit.nome}</strong> referente a ${periodoLabel(report.referenceMonth)} continua PENDENTE apos o 5o dia util do periodo.`,
      'Regularize a elaboracao o quanto antes para evitar impacto no restante do fluxo.',
    ]),
  };
}

export function buildSubmittedForReviewEmail(report: ReportInstance, unit: Unit): EmailContent {
  return {
    subject: `[RTIO] Relatorio disponivel para revisao — ${unit.sigla} (${periodoLabel(report.referenceMonth)})`,
    html: wrapHtml('Relatorio pronto para revisao', [
      `O Elaborador da unidade <strong>${unit.sigla} - ${unit.nome}</strong> submeteu o relatorio de ${periodoLabel(report.referenceMonth)} para revisao.`,
      'Acesse o RTIO para revisar os indicadores preenchidos.',
    ]),
  };
}

export function buildSubmittedForApprovalEmail(report: ReportInstance, unit: Unit): EmailContent {
  return {
    subject: `[RTIO] Relatorio pendente de aprovacao — ${unit.sigla} (${periodoLabel(report.referenceMonth)})`,
    html: wrapHtml('Relatorio pronto para a Mesa de Validacao', [
      `O relatorio da unidade <strong>${unit.sigla} - ${unit.nome}</strong> referente a ${periodoLabel(report.referenceMonth)} foi revisado e aguarda contraprova do Aprovador.`,
      'Acesse a Mesa de Validacao Tecnica no RTIO para dar seguimento.',
    ]),
  };
}

export function buildReportReprovedEmail(report: ReportInstance, unit: Unit): EmailContent {
  return {
    subject: `[RTIO] Relatorio reprovado — ${unit.sigla} (${periodoLabel(report.referenceMonth)})`,
    html: wrapHtml('Relatorio reprovado pela Mesa de Validacao', [
      `O relatorio da unidade <strong>${unit.sigla} - ${unit.nome}</strong> referente a ${periodoLabel(report.referenceMonth)} foi reprovado e retornou para correcao.`,
      report.slaExtensionDueDate
        ? `Novo prazo de correcao: <strong>${report.slaExtensionDueDate.toISOString().slice(0, 10)}</strong>.`
        : 'Consulte o RTIO para o novo prazo de correcao.',
    ]),
  };
}

export function buildReportConcludedEmail(report: ReportInstance, unit: Unit): EmailContent {
  return {
    subject: `[RTIO] Relatorio aprovado — ${unit.sigla} (${periodoLabel(report.referenceMonth)})`,
    html: wrapHtml('Relatorio aprovado', [
      `O relatorio da unidade <strong>${unit.sigla} - ${unit.nome}</strong> referente a ${periodoLabel(report.referenceMonth)} foi aprovado pela Mesa de Validacao Tecnica.`,
      'Nenhuma acao adicional e necessaria.',
    ]),
  };
}
