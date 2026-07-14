import { RoleName } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let validateCredentialsMock: jest.Mock;
  let loginMock: jest.Mock;

  const user = {
    id: 'user-1',
    matricula: '10001',
    nome: 'Teste',
    sobrenome: 'Usuario',
    email: 'teste@rtio.local',
    role: RoleName.ELABORADOR,
    primaryUnitId: 'unit-1',
  };

  beforeEach(() => {
    validateCredentialsMock = jest.fn().mockResolvedValue(user);
    loginMock = jest.fn().mockReturnValue({ accessToken: 'signed-jwt', user });
    const authService = { validateCredentials: validateCredentialsMock, login: loginMock } as unknown as AuthService;
    controller = new AuthController(authService);
  });

  test('login validates credentials and returns the signed JWT', async () => {
    const result = await controller.login({ identifier: '10001', password: 'senha-forte' });

    expect(validateCredentialsMock).toHaveBeenCalledWith('10001', 'senha-forte');
    expect(loginMock).toHaveBeenCalledWith(user);
    expect(result).toEqual({ accessToken: 'signed-jwt', user });
  });

  test('me returns the currently authenticated user unchanged', () => {
    expect(controller.me(user)).toBe(user);
  });
});
