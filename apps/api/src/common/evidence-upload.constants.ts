import { BadRequestException } from '@nestjs/common';

// Fase 12 — achado HIGH da revisao de seguranca: FileInterceptor sem
// fileFilter aceitava qualquer mimetype informado pelo cliente, gravado sem
// validacao como ContentType no S3/MinIO e depois exposto via URL
// pre-assinada (risco de XSS armazenado / distribuicao de malware
// disfarcado de evidencia). Restringe a formatos plausiveis de evidencia
// documental.
export const MAX_EVIDENCE_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export function EVIDENCE_MIME_TYPE_FILTER(
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  if (!ALLOWED_EVIDENCE_MIME_TYPES.has(file.mimetype)) {
    callback(new BadRequestException(`Tipo de arquivo nao permitido: ${file.mimetype}`), false);
    return;
  }
  callback(null, true);
}
