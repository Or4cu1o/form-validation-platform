import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validConfig = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_SECRET: 'secret',
    INITIAL_ADMIN_MATRICULA: '00001',
    INITIAL_ADMIN_EMAIL: 'admin@rtio.local',
    INITIAL_ADMIN_PASSWORD: 'strong-password',
  };

  test('returns the config unchanged when every required variable is present', () => {
    expect(validateEnv(validConfig)).toBe(validConfig);
  });

  test('throws when a single required variable is missing', () => {
    const { JWT_SECRET, ...withoutJwtSecret } = validConfig;

    expect(() => validateEnv(withoutJwtSecret)).toThrow('JWT_SECRET');
  });

  test('lists every missing variable in the error message', () => {
    expect(() => validateEnv({ DATABASE_URL: validConfig.DATABASE_URL })).toThrow(
      'JWT_SECRET, INITIAL_ADMIN_MATRICULA, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD',
    );
  });

  test('treats an empty-string value as missing', () => {
    expect(() => validateEnv({ ...validConfig, JWT_SECRET: '' })).toThrow('JWT_SECRET');
  });
});
