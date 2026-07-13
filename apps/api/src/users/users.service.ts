import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [{ matricula: identifier }, { email: identifier }],
      },
    });
  }

  findActiveById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, isActive: true },
    });
  }
}
