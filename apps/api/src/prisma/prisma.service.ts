import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Executa `fn` dentro de uma transacao com a sessao marcada com o autor
  // da alteracao (`app.current_user_id`), lida pelo trigger de auditoria
  // (ver migration add_audit_trigger). Toda escrita em tabelas auditadas
  // deve passar por aqui para que o audit_logs registre o usuario correto.
  async runWithAuditActor<T>(
    userId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`;
      return fn(tx);
    });
  }
}
