import { Injectable, Logger } from '@nestjs/common';
import { ReportStatus, Unit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getMandatoryNationalHolidays, getNthBusinessDayOfMonth, toUtcMidnight } from './business-days.util';

function previousMonthUtc(referenceMonth: Date): Date {
  return new Date(Date.UTC(referenceMonth.getUTCFullYear(), referenceMonth.getUTCMonth() - 1, 1));
}

// Abre o periodo mensal de uma unidade (Secao 4, item 1 do PROMPT.md):
// cria o ReportInstance em status PENDENTE, computa os prazos de cada fase
// em Dias Uteis e instancia um IndicatorResponse (snapshot) para cada
// indicador ativo do formulario da unidade, clonando o valor do periodo
// anterior para os indicadores marcados como Estado Residente.
@Injectable()
export class ReportLifecycleService {
  private readonly logger = new Logger(ReportLifecycleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async openPeriodForUnit(unit: Unit, referenceMonth: Date) {
    if (!unit.formTemplateId) {
      this.logger.debug(`Unidade ${unit.sigla} sem formulario associado — nenhum periodo aberto.`);
      return null;
    }

    const normalizedMonth = toUtcMidnight(referenceMonth);
    const existing = await this.prisma.reportInstance.findUnique({
      where: { unitId_referenceMonth: { unitId: unit.id, referenceMonth: normalizedMonth } },
    });
    if (existing) {
      return existing;
    }

    const year = normalizedMonth.getUTCFullYear();
    const monthIndex0 = normalizedMonth.getUTCMonth();
    const holidays = getMandatoryNationalHolidays(year);

    const elaborationDueDate = getNthBusinessDayOfMonth(year, monthIndex0, 6, holidays);
    const reviewDueDate = getNthBusinessDayOfMonth(year, monthIndex0, 8, holidays);
    const approvalDueDate = getNthBusinessDayOfMonth(year, monthIndex0, 10, holidays);

    const indicators = await this.prisma.formIndicator.findMany({
      where: { isActive: true, formTopic: { isActive: true, formTemplateId: unit.formTemplateId } },
    });

    const previousInstance = await this.prisma.reportInstance.findUnique({
      where: { unitId_referenceMonth: { unitId: unit.id, referenceMonth: previousMonthUtc(normalizedMonth) } },
      include: { indicatorResponses: true },
    });

    return this.prisma.$transaction(async (tx) => {
      const reportInstance = await tx.reportInstance.create({
        data: {
          unitId: unit.id,
          formTemplateId: unit.formTemplateId as string,
          referenceMonth: normalizedMonth,
          status: ReportStatus.PENDENTE,
          elaborationDueDate,
          reviewDueDate,
          approvalDueDate,
        },
      });

      for (const indicator of indicators) {
        const previousResponse = previousInstance?.indicatorResponses.find(
          (response) => response.formIndicatorId === indicator.id,
        );
        const shouldCloneResidentState = indicator.isResidentState && Boolean(previousResponse);

        await tx.indicatorResponse.create({
          data: {
            reportInstanceId: reportInstance.id,
            formIndicatorId: indicator.id,
            snapshotTitle: indicator.title,
            snapshotObjective: indicator.objective,
            snapshotVariableKeys: indicator.variableKeys,
            snapshotFormulaExpression: indicator.formulaExpression,
            snapshotGoalOperator: indicator.goalOperator,
            snapshotGoalValue: indicator.goalValue,
            variableValues: shouldCloneResidentState ? (previousResponse!.variableValues as object) : {},
            isClonedFromResident: shouldCloneResidentState,
          },
        });
      }

      return reportInstance;
    });
  }
}
