import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const enableHttps = process.env.ENABLE_HTTPS === 'true';
  let httpsOptions = undefined;

  if (enableHttps) {
    const keyPath = process.env.SSL_KEY_PATH;
    const certPath = process.env.SSL_CERT_PATH;
    if (keyPath && certPath) {
      const resolveRootPath = (p: string) => {
        if (path.isAbsolute(p)) return p;
        return path.resolve(process.cwd(), p);
      };
      httpsOptions = {
        key: fs.readFileSync(resolveRootPath(keyPath)),
        cert: fs.readFileSync(resolveRootPath(certPath)),
      };
    }
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });
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
  // variavel definida ou em branco, cai em modo aberto — mantem o comportamento de dev
  // existente ate o frontend real ter um dominio fixo configurado.
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin && corsOrigin.trim() !== '') {
    app.enableCors({
      origin: corsOrigin.split(',').map((o) => o.trim()),
    });
  } else {
    app.enableCors();
  }
  const port = process.env.API_PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
