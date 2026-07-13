import { BadRequestException } from '@nestjs/common';

const IDENTIFIER_PATTERN = /[A-Za-z_][A-Za-z0-9_]*/g;
const ALLOWED_CHARS_PATTERN = /^[A-Za-z0-9_+\-*/().,\s]*$/;

// Validacao de definicao (nao avaliacao) da formula textual de um indicador.
// Garante que so use os caracteres de uma expressao aritmetica e que toda
// variavel referenciada esteja entre as variableKeys declaradas — protege
// tanto contra erro de digitacao do Administrador quanto contra a formula
// ser usada depois (Fase 6) como entrada de um avaliador seguro.
export function validateFormulaExpression(expression: string, variableKeys: string[]): void {
  if (!ALLOWED_CHARS_PATTERN.test(expression)) {
    throw new BadRequestException(
      'Formula contem caracteres nao permitidos. Use apenas letras, numeros, "_", "+", "-", "*", "/", "(", ")" e ",".',
    );
  }

  const usedIdentifiers = new Set(expression.match(IDENTIFIER_PATTERN) ?? []);
  const declaredKeys = new Set(variableKeys);
  const undeclared = [...usedIdentifiers].filter((identifier) => !declaredKeys.has(identifier));

  if (undeclared.length > 0) {
    throw new BadRequestException(
      `Formula referencia chaves nao declaradas em variableKeys: ${undeclared.join(', ')}`,
    );
  }
}
