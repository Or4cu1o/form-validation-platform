import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormIndicatorDto } from './dto/create-form-indicator.dto';
import { UpdateFormIndicatorDto } from './dto/update-form-indicator.dto';
import { validateFormulaExpression } from './formula-validator.util';

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

  private async ensureExists(id: string) {
    const indicator = await this.prisma.formIndicator.findUnique({ where: { id } });
    if (!indicator) {
      throw new NotFoundException('Indicador nao encontrado');
    }
    return indicator;
  }
}
