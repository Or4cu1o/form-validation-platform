import { RoleName } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: RoleName;
  unitId: string;
}
