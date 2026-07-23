import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from './types/authenticated-user.interface';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(identifier: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findActiveByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    return this.toAuthenticatedUser(user);
  }

  login(user: AuthenticatedUser) {
    const payload: JwtPayload = { sub: user.id, role: user.role, unitId: user.primaryUnitId };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  private toAuthenticatedUser(user: {
    id: string;
    matricula: string;
    nome: string;
    sobrenome: string;
    email: string;
    role: AuthenticatedUser['role'];
    primaryUnitId: string;
    primaryUnit?: { id: string; sigla: string; nome: string };
  }): AuthenticatedUser {
    const { id, matricula, nome, sobrenome, email, role, primaryUnitId, primaryUnit } = user;
    return { id, matricula, nome, sobrenome, email, role, primaryUnitId, primaryUnit };
  }
}
