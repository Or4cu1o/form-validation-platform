import { ForbiddenException, Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';

// Roles que enxergam todas as unidades em modo leitura (Aprovador audita a
// organizacao inteira; Administrador gerencia tudo).
const ORG_WIDE_READ_ROLES: RoleName[] = [RoleName.APROVADOR, RoleName.ADMINISTRADOR];

@Injectable()
export class UnitAccessService {
  constructor(private readonly prisma: PrismaService) {}

  hasOrgWideReadAccess(user: AuthenticatedUser): boolean {
    return ORG_WIDE_READ_ROLES.includes(user.role);
  }

  // Unidade primaria + unidades extras liberadas (ex.: Observador com
  // filiais explicitamente permitidas, Secao 3 do PROMPT.md).
  async getAccessibleUnitIds(user: AuthenticatedUser): Promise<string[]> {
    const accesses = await this.prisma.userUnitAccess.findMany({
      where: { userId: user.id },
      select: { unitId: true },
    });
    return [user.primaryUnitId, ...accesses.map((access) => access.unitId)];
  }

  async assertReadAccess(unitId: string, user: AuthenticatedUser): Promise<void> {
    if (this.hasOrgWideReadAccess(user)) {
      return;
    }
    const accessibleUnitIds = await this.getAccessibleUnitIds(user);
    if (!accessibleUnitIds.includes(unitId)) {
      throw new ForbiddenException('Usuario sem acesso a esta unidade');
    }
  }
}
