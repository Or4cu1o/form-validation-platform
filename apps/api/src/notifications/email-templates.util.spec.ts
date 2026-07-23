import { ReportInstance, Unit } from '@prisma/client';
import {
  buildReportConcludedEmail,
  buildReportReprovedEmail,
  buildSlaOverdueEmail,
  buildSubmittedForApprovalEmail,
  buildSubmittedForReviewEmail,
} from './email-templates.util';

const unit = { sigla: 'FIL01', nome: 'Filial Um' } as Unit;

const baseReport = {
  referenceMonth: new Date('2026-07-01T00:00:00Z'),
  slaExtensionDueDate: null,
} as ReportInstance;

describe('email-templates.util', () => {
  test('buildSlaOverdueEmail includes unit sigla and period in subject', () => {
    const email = buildSlaOverdueEmail(baseReport, unit);
    expect(email.subject).toContain('FIL01');
    expect(email.subject).toContain('2026-07');
    expect(email.html).toContain('PENDENTE');
  });

  test('buildSubmittedForReviewEmail mentions revisao', () => {
    const email = buildSubmittedForReviewEmail(baseReport, unit);
    expect(email.subject.toLowerCase()).toContain('revisao');
    expect(email.html).toContain('Filial Um');
  });

  test('buildSubmittedForApprovalEmail mentions Mesa de Validacao', () => {
    const email = buildSubmittedForApprovalEmail(baseReport, unit);
    expect(email.html).toContain('Mesa de Validacao');
  });

  test('buildReportReprovedEmail falls back to generic message when no SLA extension date', () => {
    const email = buildReportReprovedEmail(baseReport, unit);
    expect(email.html).toContain('Consulte o FormOps para o novo prazo');
  });

  test('buildReportReprovedEmail includes formatted extension date when present', () => {
    const reportWithExtension = { ...baseReport, slaExtensionDueDate: new Date('2026-07-15T00:00:00Z') } as ReportInstance;
    const email = buildReportReprovedEmail(reportWithExtension, unit);
    expect(email.html).toContain('2026-07-15');
  });

  test('buildReportConcludedEmail mentions aprovado', () => {
    const email = buildReportConcludedEmail(baseReport, unit);
    expect(email.subject.toLowerCase()).toContain('aprovado');
  });

  test('escapes HTML in unit sigla/nome to prevent stored HTML injection in the email body', () => {
    const maliciousUnit = { sigla: '<img src=x onerror=alert(1)>', nome: 'Filial "Injetada" & Cia' } as Unit;

    const email = buildSlaOverdueEmail(baseReport, maliciousUnit);

    expect(email.html).not.toContain('<img');
    expect(email.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(email.html).toContain('Filial &quot;Injetada&quot; &amp; Cia');
  });

  test('strips CRLF from unit sigla before composing the email subject (header injection defense)', () => {
    const maliciousUnit = { sigla: 'FIL01\r\nBcc: attacker@evil.com', nome: 'Filial Um' } as Unit;

    const email = buildSlaOverdueEmail(baseReport, maliciousUnit);

    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.subject).toContain('FIL01  Bcc: attacker@evil.com');
  });
});
