import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

const USER_LIST_SELECT = {
  id: true,
  matricula: true,
  nome: true,
  sobrenome: true,
  email: true,
  role: true,
  primaryUnitId: true,
  isActive: true,
  primaryUnit: { select: { id: true, sigla: true, nome: true } },
  unitAccesses: { select: { unitId: true, unit: { select: { id: true, sigla: true, nome: true } } } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersAdminService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeInactive: boolean) {
    return this.prisma.user.findMany({
      where: includeInactive ? undefined : { isActive: true },
      select: USER_LIST_SELECT,
      orderBy: [{ nome: 'asc' }, { sobrenome: 'asc' }],
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_LIST_SELECT });
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const { password, extraUnitIds, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      return await this.prisma.user.create({
        data: {
          ...rest,
          passwordHash,
          unitAccesses: extraUnitIds?.length
            ? { create: extraUnitIds.map((unitId) => ({ unitId })) }
            : undefined,
        },
        select: USER_LIST_SELECT,
      });
    } catch (error) {
      throw this.translateUniqueConstraintError(error);
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureExists(id);
    try {
      return await this.prisma.user.update({ where: { id }, data: dto, select: USER_LIST_SELECT });
    } catch (error) {
      throw this.translateUniqueConstraintError(error);
    }
  }

  async resetPassword(id: string, newPassword: string) {
    await this.ensureExists(id);
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  }

  async setActive(id: string, isActive: boolean) {
    await this.ensureExists(id);
    return this.prisma.user.update({ where: { id }, data: { isActive }, select: USER_LIST_SELECT });
  }

  async grantUnitAccess(id: string, unitId: string) {
    await this.ensureExists(id);
    try {
      await this.prisma.userUnitAccess.create({ data: { userId: id, unitId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Usuario ja possui acesso a esta unidade');
      }
      throw error;
    }
    return this.findOne(id);
  }

  async revokeUnitAccess(id: string, unitId: string) {
    await this.ensureExists(id);
    await this.prisma.userUnitAccess.deleteMany({ where: { userId: id, unitId } });
    return this.findOne(id);
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }
    return user;
  }

  private translateUniqueConstraintError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[] | undefined)?.join(', ') ?? 'campo unico';
      return new ConflictException(`Valor duplicado para: ${target}`);
    }
    return error;
  }
}
