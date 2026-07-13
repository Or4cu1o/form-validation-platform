import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { EmailContent } from './email-templates.util';

export interface SendEmailInput extends EmailContent {
  to: string[];
}

// Transporte SMTP direto via .env (Secao 6 do PROMPT.md), sem depender de
// nenhum provedor gerenciado. Se SMTP_HOST nao estiver configurado (ambiente
// de dev sem credenciais reais), cai em modo log/console em vez de falhar.
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    this.fromAddress = this.configService.get<string>('SMTP_FROM') ?? 'RTIO <no-reply@example.com>';

    if (!host) {
      this.transporter = null;
      return;
    }

    this.transporter = createTransport({
      host,
      port: Number(this.configService.get<string>('SMTP_PORT') ?? 587),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async send(input: SendEmailInput): Promise<void> {
    if (input.to.length === 0) {
      return;
    }

    if (!this.transporter) {
      this.logger.log(`[modo log — SMTP_HOST ausente] Para: ${input.to.join(', ')} | Assunto: ${input.subject}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: input.to.join(', '),
      subject: input.subject,
      html: input.html,
    });
  }
}
