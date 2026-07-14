import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { EmailService } from './email.service';

const sendMailMock = jest.fn().mockResolvedValue(undefined);

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({ sendMail: sendMailMock })),
}));

describe('EmailService', () => {
  function buildConfigService(values: Record<string, string | undefined>): ConfigService {
    return { get: jest.fn((key: string) => values[key]) } as unknown as ConfigService;
  }

  beforeEach(() => {
    sendMailMock.mockClear();
    jest.mocked(createTransport).mockClear();
  });

  describe('log-mode fallback (SMTP_HOST absent)', () => {
    let service: EmailService;

    beforeEach(() => {
      service = new EmailService(buildConfigService({}));
    });

    test('does not create a real transporter', () => {
      expect(createTransport).not.toHaveBeenCalled();
    });

    test('logs instead of sending when SMTP_HOST is not configured', async () => {
      await service.send({ to: ['user@rtio.local'], subject: 'Assunto', html: '<p>Corpo</p>' });

      expect(sendMailMock).not.toHaveBeenCalled();
    });

    test('no-ops without logging when the recipient list is empty', async () => {
      await service.send({ to: [], subject: 'Assunto', html: '<p>Corpo</p>' });

      expect(sendMailMock).not.toHaveBeenCalled();
    });
  });

  describe('real SMTP transport (SMTP_HOST present)', () => {
    let service: EmailService;

    beforeEach(() => {
      service = new EmailService(
        buildConfigService({
          SMTP_HOST: 'smtp.rtio.local',
          SMTP_PORT: '587',
          SMTP_SECURE: 'false',
          SMTP_USER: 'user',
          SMTP_PASSWORD: 'pass',
          SMTP_FROM: 'RTIO <no-reply@rtio.local>',
        }),
      );
    });

    test('creates a real nodemailer transporter with the configured SMTP settings', () => {
      expect(createTransport).toHaveBeenCalledWith({
        host: 'smtp.rtio.local',
        port: 587,
        secure: false,
        auth: { user: 'user', pass: 'pass' },
      });
    });

    test('sends the email through the transporter with the configured from address', async () => {
      await service.send({ to: ['user@rtio.local'], subject: 'Assunto', html: '<p>Corpo</p>' });

      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'RTIO <no-reply@rtio.local>',
        to: 'user@rtio.local',
        subject: 'Assunto',
        html: '<p>Corpo</p>',
      });
    });

    test('joins multiple recipients with a comma', async () => {
      await service.send({ to: ['a@rtio.local', 'b@rtio.local'], subject: 'Assunto', html: '<p>Corpo</p>' });

      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@rtio.local, b@rtio.local' }));
    });
  });
});
