import { HealthController } from './health.controller';

describe('HealthController', () => {
  test('check returns an ok status with a current ISO timestamp', () => {
    const controller = new HealthController();

    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
