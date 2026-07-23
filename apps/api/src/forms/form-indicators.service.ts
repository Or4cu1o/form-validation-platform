import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormIndicatorDto } from './dto/create-form-indicator.dto';
import { UpdateFormIndicatorDto } from './dto/update-form-indicator.dto';
import { UpdateIndicatorScoresDto } from './dto/update-indicator-scores.dto';
import { validateFormulaExpression } from './formula-validator.util';
import { distributeScoreWeights } from './score-distribution.util';

const TOTAL_SCORE_BUDGET = 10;
const SCORE_SUM_TOLERANCE = 0.01;

@Injectable()
export class FormIndicatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(formTopicId: string, dto: CreateFormIndicatorDto) {
    const topic = await this.prisma.formTopic.findUnique({ where: { id: formTopicId } });
    if (!topic) {
      throw new NotFoundException('Topico nao encontrado');
    }
    validateFormulaExpression(dto.formulaExpression, dto.variableKeys);

    return this.prisma.formIndicator.create({
      data: { ...dto, formTopicId },
    });
  }

  async update(id: string, dto: UpdateFormIndicatorDto) {
    const indicator = await this.ensureExists(id);

    const nextVariableKeys = dto.variableKeys ?? indicator.variableKeys;
    const nextFormula = dto.formulaExpression ?? indicator.formulaExpression;
    validateFormulaExpression(nextFormula, nextVariableKeys);

    return this.prisma.formIndicator.update({ where: { id }, data: dto });
  }

  async setActive(id: string, isActive: boolean) {
    await this.ensureExists(id);
    return this.prisma.formIndicator.update({ where: { id }, data: { isActive } });
  }

  async getScores(formTemplateId: string) {
    const indicators = await this.findActiveIndicators(formTemplateId);
    return this.buildScoreSummary(indicators);
  }

  async updateScores(formTemplateId: string, dto: UpdateIndicatorScoresDto) {
    const indicators = await this.findActiveIndicators(formTemplateId);
    const activeIds = new Set(indicators.map((indicator) => indicator.id));
    const providedIds = new Set(dto.weights.map((entry) => entry.indicatorId));

    if (activeIds.size !== providedIds.size || [...activeIds].some((id) => !providedIds.has(id))) {
      throw new BadRequestException(
        'O corpo da requisicao deve conter exatamente os indicadores ativos deste formulario.',
      );
    }

    const sum = dto.weights.reduce((total, entry) => total + entry.scoreWeight, 0);
    if (Math.abs(sum - TOTAL_SCORE_BUDGET) > SCORE_SUM_TOLERANCE) {
      throw new BadRequestException(
        `A soma dos pesos dos indicadores deve ser ${TOTAL_SCORE_BUDGET} (atual: ${sum.toFixed(2)}).`,
      );
    }

    await this.prisma.$transaction(
      dto.weights.map((entry) =>
        this.prisma.formIndicator.update({
          where: { id: entry.indicatorId },
          data: { scoreWeight: entry.scoreWeight },
        }),
      ),
    );

    const updated = await this.findActiveIndicators(formTemplateId);
    return this.buildScoreSummary(updated);
  }

  async distributeEvenly(formTemplateId: string) {
    const indicators = await this.findActiveIndicators(formTemplateId);
    if (indicators.length === 0) {
      throw new BadRequestException('O formulario nao possui indicadores ativos para distribuir a pontuacao.');
    }

    const weights = distributeScoreWeights(indicators.length, TOTAL_SCORE_BUDGET);
    await this.prisma.$transaction(
      indicators.map((indicator, index) =>
        this.prisma.formIndicator.update({
          where: { id: indicator.id },
          data: { scoreWeight: weights[index] },
        }),
      ),
    );

    const updated = await this.findActiveIndicators(formTemplateId);
    return this.buildScoreSummary(updated);
  }

  private async findActiveIndicators(formTemplateId: string) {
    const template = await this.prisma.formTemplate.findUnique({ where: { id: formTemplateId } });
    if (!template) {
      throw new NotFoundException('Formulario nao encontrado');
    }

    return this.prisma.formIndicator.findMany({
      where: { isActive: true, formTopic: { isActive: true, formTemplateId } },
      orderBy: [{ formTopic: { order: 'asc' } }, { order: 'asc' }],
    });
  }

  private buildScoreSummary(indicators: Array<{ id: string; title: string; scoreWeight: unknown }>) {
    const items = indicators.map((indicator) => ({
      id: indicator.id,
      title: indicator.title,
      scoreWeight: Number(indicator.scoreWeight),
    }));
    const sum = items.reduce((total, item) => total + item.scoreWeight, 0);
    return { items, sum, target: TOTAL_SCORE_BUDGET };
  }

  private async ensureExists(id: string) {
    const indicator = await this.prisma.formIndicator.findUnique({ where: { id } });
    if (!indicator) {
      throw new NotFoundException('Indicador nao encontrado');
    }
    return indicator;
  }
}
