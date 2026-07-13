import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ValidationVerdict } from '@prisma/client';

export class ValidateIndicatorDto {
  @IsEnum(ValidationVerdict)
  verdict!: ValidationVerdict;

  // Parecer tecnico-operacional obrigatorio (Secao 5 do PROMPT.md: "janela
  // modal de texto pequena obrigatoria").
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  justification!: string;
}
