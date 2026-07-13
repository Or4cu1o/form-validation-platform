import { PrismaClient, RoleName, UnitLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEV_TEST_PASSWORD = 'RtioTeste@2026';

const DEV_ROLE_USERS: Array<{ matricula: string; nome: string; sobrenome: string; role: RoleName }> = [
  { matricula: '10001', nome: 'Teste', sobrenome: 'Observador', role: RoleName.OBSERVADOR },
  { matricula: '10002', nome: 'Teste', sobrenome: 'Elaborador', role: RoleName.ELABORADOR },
  { matricula: '10003', nome: 'Teste', sobrenome: 'Revisor', role: RoleName.REVISOR },
  { matricula: '10004', nome: 'Teste', sobrenome: 'Aprovador', role: RoleName.APROVADOR },
  { matricula: '10005', nome: 'Teste', sobrenome: 'Administrador', role: RoleName.ADMINISTRADOR },
];

async function ensureMatrizUnit() {
  return prisma.unit.upsert({
    where: { sigla: 'MATRIZ' },
    update: {},
    create: { sigla: 'MATRIZ', nome: 'Matriz', level: UnitLevel.A },
  });
}

async function ensureInitialAdmin(matrizUnitId: string) {
  const matricula = process.env.INITIAL_ADMIN_MATRICULA;
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!matricula || !email || !password) {
    throw new Error(
      'INITIAL_ADMIN_MATRICULA, INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD sao obrigatorios para o seed.',
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { matricula },
    update: { email, passwordHash, role: RoleName.ADMINISTRADOR, primaryUnitId: matrizUnitId, isActive: true },
    create: {
      matricula,
      nome: 'Administrador',
      sobrenome: 'Inicial',
      email,
      passwordHash,
      role: RoleName.ADMINISTRADOR,
      primaryUnitId: matrizUnitId,
    },
  });

  console.log(`[seed] Admin inicial garantido: matricula=${matricula} email=${email}`);
}

async function ensureDevRoleUsers(matrizUnitId: string) {
  const passwordHash = await bcrypt.hash(DEV_TEST_PASSWORD, SALT_ROUNDS);

  for (const roleUser of DEV_ROLE_USERS) {
    const email = `${roleUser.role.toLowerCase()}@matriz.dev`;
    await prisma.user.upsert({
      where: { matricula: roleUser.matricula },
      update: {
        email,
        passwordHash,
        role: roleUser.role,
        primaryUnitId: matrizUnitId,
        isActive: true,
      },
      create: {
        matricula: roleUser.matricula,
        nome: roleUser.nome,
        sobrenome: roleUser.sobrenome,
        email,
        passwordHash,
        role: roleUser.role,
        primaryUnitId: matrizUnitId,
      },
    });
  }

  console.log(`[seed] ${DEV_ROLE_USERS.length} usuarios de teste (1 por role) garantidos na unidade MATRIZ.`);
  console.log(`[seed] Senha padrao dos usuarios de teste: ${DEV_TEST_PASSWORD}`);
}

async function main() {
  const matriz = await ensureMatrizUnit();
  await ensureInitialAdmin(matriz.id);

  if (process.env.NODE_ENV !== 'production') {
    await ensureDevRoleUsers(matriz.id);
  }
}

main()
  .catch((error) => {
    console.error('[seed] Falha ao executar seed core:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
