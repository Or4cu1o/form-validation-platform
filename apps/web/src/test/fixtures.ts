import type { AuthenticatedUser, ReportInstance, Unit } from '../types/api';

export function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 'user-1',
    matricula: '001',
    nome: 'Ana',
    sobrenome: 'Silva',
    email: 'ana@example.com',
    role: 'ELABORADOR',
    primaryUnitId: 'unit-1',
    ...overrides,
  };
}

export function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: 'unit-1',
    sigla: 'TI',
    nome: 'Tecnologia da Informação',
    logoUrl: null,
    level: 'A',
    formTemplateId: 'template-1',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    formTemplate: { id: 'template-1', name: 'Formulário Mensal' },
    ...overrides,
  };
}

export function makeReportInstance(overrides: Partial<ReportInstance> = {}): ReportInstance {
  return {
    id: 'report-1',
    unitId: 'unit-1',
    formTemplateId: 'template-1',
    referenceMonth: '2026-03-01',
    status: 'PENDENTE',
    elaborationDueDate: '2026-04-05T00:00:00.000Z',
    reviewDueDate: '2026-04-10T00:00:00.000Z',
    approvalDueDate: '2026-04-15T00:00:00.000Z',
    reprovalCount: 0,
    slaExtensionDueDate: null,
    submittedForReviewAt: null,
    submittedForApprovalAt: null,
    concludedAt: null,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    unit: makeUnit(),
    indicatorResponses: [],
    ...overrides,
  };
}
