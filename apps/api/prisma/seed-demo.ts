import {
  GoalOperator,
  IndicatorValidationStatus,
  PrismaClient,
  ReportStatus,
  RoleName,
  UnitLevel,
  ValidationVerdict,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { checkCompliance, evaluateFormula } from '../src/forms/formula-evaluator.util';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEV_TEST_PASSWORD = 'FormOpsTeste@2026';

// ---------------------------------------------------------------------------
// Definição das 5 Unidades Hospitalares da Demonstração
// ---------------------------------------------------------------------------
interface DemoUnitConfig {
  sigla: string;
  nome: string;
  level: UnitLevel;
  templateNamePrefix: 'N1' | 'N3';
  elaboradorMatricula: string;
  elaboradorNome: string;
  elaboradorSobrenome: string;
  elaboradorEmail: string;
  revisorMatricula: string;
  revisorNome: string;
  revisorSobrenome: string;
  revisorEmail: string;
}

const DEMO_UNITS: DemoUnitConfig[] = [
  {
    sigla: 'HUGO',
    nome: 'Hospital de Urgências de Goiás',
    level: UnitLevel.A,
    templateNamePrefix: 'N1',
    elaboradorMatricula: '20001',
    elaboradorNome: 'Eduardo',
    elaboradorSobrenome: 'Oliveira',
    elaboradorEmail: 'elaborador.hugo@matriz.dev',
    revisorMatricula: '30001',
    revisorNome: 'Renata',
    revisorSobrenome: 'Martins',
    revisorEmail: 'revisor.hugo@matriz.dev',
  },
  {
    sigla: 'HEAPA',
    nome: 'Hospital Estadual de Aparecida de Goiânia',
    level: UnitLevel.B,
    templateNamePrefix: 'N1',
    elaboradorMatricula: '20002',
    elaboradorNome: 'Enzo',
    elaboradorSobrenome: 'Rodrigues',
    elaboradorEmail: 'elaborador.heapa@matriz.dev',
    revisorMatricula: '30002',
    revisorNome: 'Rodrigo',
    revisorSobrenome: 'Ferreira',
    revisorEmail: 'revisor.heapa@matriz.dev',
  },
  {
    sigla: 'HUGOL',
    nome: 'Hospital de Urgências Governador Otávio Lage',
    level: UnitLevel.A,
    templateNamePrefix: 'N3',
    elaboradorMatricula: '20003',
    elaboradorNome: 'Eliane',
    elaboradorSobrenome: 'Costa',
    elaboradorEmail: 'elaborador.hugol@matriz.dev',
    revisorMatricula: '30003',
    revisorNome: 'Rafael',
    revisorSobrenome: 'Lima',
    revisorEmail: 'revisor.hugol@matriz.dev',
  },
  {
    sigla: 'HETRIN',
    nome: 'Hospital Estadual de Trindade',
    level: UnitLevel.B,
    templateNamePrefix: 'N3',
    elaboradorMatricula: '20004',
    elaboradorNome: 'Evelyn',
    elaboradorSobrenome: 'Santos',
    elaboradorEmail: 'elaborador.hetrin@matriz.dev',
    revisorMatricula: '30004',
    revisorNome: 'Raquel',
    revisorSobrenome: 'Barbosa',
    revisorEmail: 'revisor.hetrin@matriz.dev',
  },
  {
    sigla: 'HECAD',
    nome: 'Hospital Estadual da Criança e do Adolescente',
    level: UnitLevel.A,
    templateNamePrefix: 'N3',
    elaboradorMatricula: '20005',
    elaboradorNome: 'Eric',
    elaboradorSobrenome: 'Almeida',
    elaboradorEmail: 'elaborador.hecad@matriz.dev',
    revisorMatricula: '30005',
    revisorNome: 'Ricardo',
    revisorSobrenome: 'Cardoso',
    revisorEmail: 'revisor.hecad@matriz.dev',
  },
];

// ---------------------------------------------------------------------------
// Gerador de Variáveis Realistas por Indicador e Mês
// ---------------------------------------------------------------------------
function generateVariableValues(
  variableKeys: string[],
  monthIndex: number, // 0 = Jan, 1 = Fev ... 5 = Jun
  templatePrefix: 'N1' | 'N3',
): Record<string, number> {
  const isN3 = templatePrefix === 'N3';
  const scale = isN3 ? 2 : 1;
  const daysInMonth = [31, 28, 31, 30, 31, 30][monthIndex] || 30;
  const minutosMensais = daysInMonth * 24 * 60;
  const sortedKeys = [...variableKeys].sort().join(',');

  if (sortedKeys === 'EGA,ENG') {
    const ega = (490 + monthIndex * 3) * scale;
    const eng = 10 * scale;
    return { EGA: ega, ENG: eng };
  }

  if (sortedKeys === 'EGA,EGI') {
    const ega = 980 + monthIndex * 5;
    const egi = ega + 5;
    return { EGA: ega, EGI: egi };
  }

  if (sortedKeys === 'PRE') {
    const pre = 18 - (monthIndex % 4);
    return { PRE: pre };
  }

  if (sortedKeys === 'RNR,TOM') {
    const tom = (15 + monthIndex * 2) * scale;
    const rnr = monthIndex % 2 === 0 ? 0 : 1;
    return { TOM: tom, RNR: rnr };
  }

  if (sortedKeys === 'ARA,TAR') {
    const tar = 5 + (monthIndex % 3);
    const ara = tar;
    return { TAR: tar, ARA: ara };
  }

  if (sortedKeys === 'MVL,MVP,SFP,SGA') {
    const sfp = 10 * scale;
    const sga = sfp;
    const mvp = 40 * scale;
    const mvl = mvp;
    return { SFP: sfp, SGA: sga, MVP: mvp, MVL: mvl };
  }

  if (sortedKeys === 'IFP,MINUTOS_MENSAIS') {
    const ifp = 10 + monthIndex * 2;
    return { IFP: ifp, MINUTOS_MENSAIS: minutosMensais };
  }

  if (sortedKeys === 'DBR,DRC,MBR,MVC') {
    const mvc = 50 + monthIndex * 2;
    const mbr = mvc;
    const drc = 20;
    const dbr = 20;
    return { MVC: mvc, MBR: mbr, DRC: drc, DBR: dbr };
  }

  if (sortedKeys.includes('NOBREAK') && sortedKeys.includes('TEMP')) {
    return {
      TEMP: 1,
      NOBREAK: 1,
      CABOS: 1,
      LIMPEZA_RACK: 1,
      GOTEIRAS: 1,
      ACESSO_FISICO: 1,
      CAMERAS: 1,
      RUIDOS: 1,
    };
  }

  if (sortedKeys === 'ICL,MINUTOS_MENSAIS') {
    const icl = 15 + monthIndex * 3;
    return { ICL: icl, MINUTOS_MENSAIS: minutosMensais };
  }

  if (sortedKeys === 'CA,CB') {
    const ca = (200 + monthIndex * 20) * scale;
    const cb = Math.floor(ca * 0.03); // ~3% backlog (meta <= 5%)
    return { CA: ca, CB: cb };
  }

  if (sortedKeys === 'APP,ARP') {
    const app = 2 + (monthIndex % 2);
    const arp = app;
    return { APP: app, ARP: arp };
  }

  if (sortedKeys === 'RP,RR') {
    const rp = 10 + monthIndex;
    const rr = rp;
    return { RP: rp, RR: rr };
  }

  // Fallback seguro caso haja variavel dinamica
  const fallback: Record<string, number> = {};
  variableKeys.forEach((key) => {
    fallback[key] = 10;
  });
  return fallback;
}

// Análise crítica personalizada e realista
function generateCriticalAnalysis(indicatorTitle: string, monthName: string): string {
  if (indicatorTitle.includes('Antivírus')) {
    return `Solução de antivírus corporativo mantida com cobertura contínua nas estações de trabalho durante ${monthName}.`;
  }
  if (indicatorTitle.includes('Servidores')) {
    return `Ambiente de servidores operando em 100% de conformidade de garantia e licenciamento no mês de ${monthName}.`;
  }
  if (indicatorTitle.includes('Disponibilidade')) {
    return `Disponibilidade do link mantida dentro da SLA contratada durante ${monthName}, sem indícios de instabilidade crítica.`;
  }
  if (indicatorTitle.includes('Chamados')) {
    return `Volume de backlog controlado e mantido abaixo do limite teto tático de 5% no período de ${monthName}.`;
  }
  return `Indicador avaliado e aprovado conforme os parâmetros de governança técnica definidos para ${monthName}.`;
}

async function main() {
  console.log('=== Iniciando Seed da Demonstração (5 Unidades / Jan-Jun 2026) ===');

  // 1. Obter os formulários N1 e N3 do banco
  const n1Template = await prisma.formTemplate.findFirst({
    where: { name: { startsWith: 'N1' } },
    include: { topics: { include: { indicators: true } } },
  });
  const n3Template = await prisma.formTemplate.findFirst({
    where: { name: { startsWith: 'N3' } },
    include: { topics: { include: { indicators: true } } },
  });

  if (!n1Template || !n3Template) {
    throw new Error(
      'Formulários N1 e N3 não foram encontrados no banco. Execute "npm run seed:proprietary" antes do seed de demonstração.',
    );
  }

  // 2. Garantir o Usuário Aprovador da Matriz para aprovar as demonstrações
  let aprovadorMatriz = await prisma.user.findFirst({
    where: { role: RoleName.APROVADOR },
  });

  if (!aprovadorMatriz) {
    const matrizUnit = await prisma.unit.findFirstOrThrow({ where: { sigla: 'MATRIZ' } });
    const passwordHash = await bcrypt.hash(DEV_TEST_PASSWORD, SALT_ROUNDS);
    aprovadorMatriz = await prisma.user.create({
      data: {
        matricula: '10004',
        nome: 'Aprovador',
        sobrenome: 'Matriz',
        email: 'aprovador@matriz.dev',
        passwordHash,
        role: RoleName.APROVADOR,
        primaryUnitId: matrizUnit.id,
      },
    });
  }

  const passwordHash = await bcrypt.hash(DEV_TEST_PASSWORD, SALT_ROUNDS);

  // 3. Processar cada uma das 5 unidades hospitalares
  for (const config of DEMO_UNITS) {
    const template = config.templateNamePrefix === 'N1' ? n1Template : n3Template;

    // 3.1 Upsert da Unidade
    const unit = await prisma.unit.upsert({
      where: { sigla: config.sigla },
      update: {
        nome: config.nome,
        level: config.level,
        formTemplateId: template.id,
        isActive: true,
      },
      create: {
        sigla: config.sigla,
        nome: config.nome,
        level: config.level,
        formTemplateId: template.id,
        isActive: true,
      },
    });

    // 3.2 Upsert do Elaborador da Unidade
    const elaborador = await prisma.user.upsert({
      where: { matricula: config.elaboradorMatricula },
      update: {
        nome: config.elaboradorNome,
        sobrenome: config.elaboradorSobrenome,
        email: config.elaboradorEmail,
        passwordHash,
        role: RoleName.ELABORADOR,
        primaryUnitId: unit.id,
        isActive: true,
      },
      create: {
        matricula: config.elaboradorMatricula,
        nome: config.elaboradorNome,
        sobrenome: config.elaboradorSobrenome,
        email: config.elaboradorEmail,
        passwordHash,
        role: RoleName.ELABORADOR,
        primaryUnitId: unit.id,
      },
    });

    // 3.3 Upsert do Revisor da Unidade
    await prisma.user.upsert({
      where: { matricula: config.revisorMatricula },
      update: {
        nome: config.revisorNome,
        sobrenome: config.revisorSobrenome,
        email: config.revisorEmail,
        passwordHash,
        role: RoleName.REVISOR,
        primaryUnitId: unit.id,
        isActive: true,
      },
      create: {
        matricula: config.revisorMatricula,
        nome: config.revisorNome,
        sobrenome: config.revisorSobrenome,
        email: config.revisorEmail,
        passwordHash,
        role: RoleName.REVISOR,
        primaryUnitId: unit.id,
      },
    });

    console.log(`✓ Unidade ${unit.sigla} (${unit.nome}) e usuários de acesso sincronizados.`);

    // 4. Gerar relatórios mensais de Janeiro (mês 1) até Junho (mês 6) de 2026
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];

    for (let m = 0; m < 6; m++) {
      const year = 2026;
      const monthNum = m + 1;
      const referenceMonth = new Date(Date.UTC(year, m, 1));
      const monthNameStr = `${monthNames[m]} de ${year}`;

      // Prazos estimados do mês seguinte
      const elaborationDueDate = new Date(Date.UTC(year, m + 1, 8));
      const reviewDueDate = new Date(Date.UTC(year, m + 1, 10));
      const approvalDueDate = new Date(Date.UTC(year, m + 1, 14));

      // Datas reais de tramitação no fluxo (sempre pontual no prazo)
      const submittedForReviewAt = new Date(Date.UTC(year, m + 1, 4, 14, 30));
      const submittedForApprovalAt = new Date(Date.UTC(year, m + 1, 7, 10, 15));
      const concludedAt = new Date(Date.UTC(year, m + 1, 9, 16, 45));

      const reportInstance = await prisma.reportInstance.upsert({
        where: {
          unitId_referenceMonth: {
            unitId: unit.id,
            referenceMonth,
          },
        },
        update: {
          formTemplateId: template.id,
          status: ReportStatus.CONCLUIDO,
          elaborationDueDate,
          reviewDueDate,
          approvalDueDate,
          submittedForReviewAt,
          submittedForApprovalAt,
          concludedAt,
          indicatorScore: 10.0,
          slaDeflatorApplied: 0.0,
          totalScore: 10.0,
          isElaborationOnTime: true,
          isReviewOnTime: true,
        },
        create: {
          unitId: unit.id,
          formTemplateId: template.id,
          referenceMonth,
          status: ReportStatus.CONCLUIDO,
          elaborationDueDate,
          reviewDueDate,
          approvalDueDate,
          submittedForReviewAt,
          submittedForApprovalAt,
          concludedAt,
          indicatorScore: 10.0,
          slaDeflatorApplied: 0.0,
          totalScore: 10.0,
          isElaborationOnTime: true,
          isReviewOnTime: true,
        },
      });

      // 5. Criar IndicatorResponses para todos os indicadores do formulário da unidade
      const allIndicators = template.topics.flatMap((t) => t.indicators);

      for (const indicator of allIndicators) {
        const variableValues = generateVariableValues(indicator.variableKeys, m, config.templateNamePrefix);
        const calculatedValue = evaluateFormula(indicator.formulaExpression, variableValues);
        const isCompliant = checkCompliance(calculatedValue, indicator.goalOperator, Number(indicator.goalValue));
        const criticalAnalysis = generateCriticalAnalysis(indicator.title, monthNameStr);

        const response = await prisma.indicatorResponse.upsert({
          where: {
            reportInstanceId_formIndicatorId: {
              reportInstanceId: reportInstance.id,
              formIndicatorId: indicator.id,
            },
          },
          update: {
            snapshotTitle: indicator.title,
            snapshotObjective: indicator.objective,
            snapshotVariableKeys: indicator.variableKeys,
            snapshotFormulaExpression: indicator.formulaExpression,
            snapshotGoalOperator: indicator.goalOperator,
            snapshotGoalValue: indicator.goalValue,
            snapshotScoreWeight: indicator.scoreWeight,
            variableValues,
            calculatedValue,
            isCompliant,
            validationStatus: IndicatorValidationStatus.APROVADO,
            criticalAnalysis,
            updatedByUserId: elaborador.id,
          },
          create: {
            reportInstanceId: reportInstance.id,
            formIndicatorId: indicator.id,
            snapshotTitle: indicator.title,
            snapshotObjective: indicator.objective,
            snapshotVariableKeys: indicator.variableKeys,
            snapshotFormulaExpression: indicator.formulaExpression,
            snapshotGoalOperator: indicator.goalOperator,
            snapshotGoalValue: indicator.goalValue,
            snapshotScoreWeight: indicator.scoreWeight,
            variableValues,
            calculatedValue,
            isCompliant,
            validationStatus: IndicatorValidationStatus.APROVADO,
            criticalAnalysis,
            updatedByUserId: elaborador.id,
          },
        });

        // 6. Criar Registro de Validação Técnica do Aprovador
        const existingRecord = await prisma.validationRecord.findFirst({
          where: {
            indicatorResponseId: response.id,
            aprovadorUserId: aprovadorMatriz.id,
          },
        });

        if (!existingRecord) {
          await prisma.validationRecord.create({
            data: {
              indicatorResponseId: response.id,
              aprovadorUserId: aprovadorMatriz.id,
              verdict: ValidationVerdict.APROVADO,
              justification: 'Validação técnica realizada e aprovada conforme métricas e evidências de governança.',
            },
          });
        }
      }
    }
    console.log(`  └─ 6 relatórios concluídos (Jan-Jun 2026) gerados para a unidade ${config.sigla}.`);
  }

  console.log('\n=== Seed de Demonstração Concluído com Sucesso! ===');
}

main()
  .catch((error) => {
    console.error('Falha ao executar seed de demonstração:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
