import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // CORS_ORIGIN restringe a origem em producao (Fase 12 — achado MEDIUM:
  // enableCors() sem opcoes libera Access-Control-Allow-Origin: *). Sem a
  // variavel definida, cai em modo aberto — mantem o comportamento de dev
  // existente ate o frontend real ter um dominio fixo configurado.
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors(corsOrigin ? { origin: corsOrigin.split(',') } : undefined);
  const port = process.env.API_PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
