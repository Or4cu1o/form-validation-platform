import { GoalOperator, PrismaClient } from '@prisma/client';

// Helpers de seed idempotente para os formularios proprietarios N1/N3
// (Secao 4 do PROMPT.md — "Injecao de Templates Proprietarios"). FormTopic e
// FormIndicator nao tem unique constraint composta no schema (so
// FormTemplate.name e @unique), entao usamos findFirst + create/update em
// vez de prisma.upsert() para manter os scripts re-executaveis sem duplicar
// linhas a cada rodada.

export interface IndicatorSeed {
  title: string;
  objective: string;
  variableKeys: string[];
  formulaExpression: string;
  goalOperator: GoalOperator;
  goalValue: number;
  isResidentState?: boolean;
  order: number;
}

export interface TopicSeed {
  title: string;
  order: number;
  indicators: IndicatorSeed[];
}

export interface FormTemplateSeed {
  name: string;
  description: string;
  topics: TopicSeed[];
}

export async function seedFormTemplate(prisma: PrismaClient, template: FormTemplateSeed): Promise<void> {
  const formTemplate = await prisma.formTemplate.upsert({
    where: { name: template.name },
    update: { description: template.description },
    create: { name: template.name, description: template.description },
  });

  for (const topic of template.topics) {
    const formTopic = await upsertTopic(prisma, formTemplate.id, topic.title, topic.order);

    for (const indicator of topic.indicators) {
      await upsertIndicator(prisma, formTopic.id, indicator);
    }
  }

  console.log(`[seed-proprietary] Template "${template.name}" garantido (${template.topics.length} topico(s)).`);
}

async function upsertTopic(prisma: PrismaClient, formTemplateId: string, title: string, order: number) {
  const existing = await prisma.formTopic.findFirst({ where: { formTemplateId, title } });
  if (existing) {
    return prisma.formTopic.update({ where: { id: existing.id }, data: { order, isActive: true } });
  }
  return prisma.formTopic.create({ data: { formTemplateId, title, order } });
}

async function upsertIndicator(prisma: PrismaClient, formTopicId: string, indicator: IndicatorSeed) {
  const existing = await prisma.formIndicator.findFirst({ where: { formTopicId, title: indicator.title } });
  const data = {
    objective: indicator.objective,
    variableKeys: indicator.variableKeys,
    formulaExpression: indicator.formulaExpression,
    goalOperator: indicator.goalOperator,
    goalValue: indicator.goalValue,
    isResidentState: indicator.isResidentState ?? false,
    order: indicator.order,
    isActive: true,
  };

  if (existing) {
    return prisma.formIndicator.update({ where: { id: existing.id }, data });
  }
  return prisma.formIndicator.create({ data: { formTopicId, title: indicator.title, ...data } });
}
