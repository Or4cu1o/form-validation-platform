import type { GoalOperator, IndicatorValidationStatus, ReportStatus, RoleName, UnitLevel, ValidationVerdict } from '../types/api';

export type StatusTone = 'pendente' | 'revisao' | 'aprovacao' | 'concluido' | 'reprovado';

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDENTE: 'Pendente',
  EM_REVISAO: 'Em revisão',
  PENDENTE_APROVACAO: 'Pendente de aprovação',
  CONCLUIDO: 'Concluído',
};

export const REPORT_STATUS_TONE: Record<ReportStatus, StatusTone> = {
  PENDENTE: 'pendente',
  EM_REVISAO: 'revisao',
  PENDENTE_APROVACAO: 'aprovacao',
  CONCLUIDO: 'concluido',
};

export const INDICATOR_VALIDATION_LABEL: Record<IndicatorValidationStatus, string> = {
  EM_REVISAO: 'Em revisão',
  PENDENTE_VALIDACAO: 'Pendente de validação',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};

export const INDICATOR_VALIDATION_TONE: Record<IndicatorValidationStatus, StatusTone> = {
  EM_REVISAO: 'revisao',
  PENDENTE_VALIDACAO: 'aprovacao',
  APROVADO: 'concluido',
  REPROVADO: 'reprovado',
};

export const VALIDATION_VERDICT_LABEL: Record<ValidationVerdict, string> = {
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};

export const ROLE_LABEL: Record<RoleName, string> = {
  OBSERVADOR: 'Observador',
  ELABORADOR: 'Elaborador',
  REVISOR: 'Revisor',
  APROVADOR: 'Aprovador',
  ADMINISTRADOR: 'Administrador',
};

export const UNIT_LEVEL_LABEL: Record<UnitLevel, string> = {
  A: 'Nível A',
  B: 'Nível B',
  C: 'Nível C',
};

export const GOAL_OPERATOR_SYMBOL: Record<GoalOperator, string> = {
  GTE: '≥',
  LTE: '≤',
  EQ: '=',
  GT: '>',
  LT: '<',
};
