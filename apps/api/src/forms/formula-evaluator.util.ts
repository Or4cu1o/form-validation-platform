import { BadRequestException } from '@nestjs/common';
import { GoalOperator } from '@prisma/client';

// Avaliador aritmetico seguro para a formula textual de um indicador —
// NUNCA usa eval()/Function() sobre entrada de usuario. So entende numeros,
// identificadores (substituidos pelos valores informados) e + - * / ( ).
// A definicao da formula ja e validada em formula-validator.util.ts; este
// avaliador assume esse mesmo alfabeto restrito.

type TokenType = 'NUMBER' | 'IDENTIFIER' | 'OP' | 'LPAREN' | 'RPAREN' | 'EOF';
interface Token {
  type: TokenType;
  value: string;
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\s*(?:([A-Za-z_][A-Za-z0-9_]*)|(\d+(?:\.\d+)?)|([+\-*/])|(\()|(\)))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(expression)) !== null) {
    if (match.index !== lastIndex) {
      throw new BadRequestException(`Formula invalida proxima a: "${expression.slice(lastIndex)}"`);
    }
    lastIndex = pattern.lastIndex;
    const [, identifier, number, operator, lparen, rparen] = match;
    if (identifier) tokens.push({ type: 'IDENTIFIER', value: identifier });
    else if (number) tokens.push({ type: 'NUMBER', value: number });
    else if (operator) tokens.push({ type: 'OP', value: operator });
    else if (lparen) tokens.push({ type: 'LPAREN', value: lparen });
    else if (rparen) tokens.push({ type: 'RPAREN', value: rparen });
  }
  if (lastIndex !== expression.length) {
    throw new BadRequestException(`Formula invalida proxima a: "${expression.slice(lastIndex)}"`);
  }
  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

// Gramatica (precedencia padrao): expr := term (('+'|'-') term)*
//                                  term := factor (('*'|'/') factor)*
//                                  factor := NUMBER | IDENTIFIER | '(' expr ')' | '-' factor
class Parser {
  private position = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly values: Record<string, number>,
  ) {}

  parse(): number {
    const result = this.parseExpression();
    this.expect('EOF');
    return result;
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private consume(): Token {
    return this.tokens[this.position++];
  }

  private expect(type: TokenType): Token {
    const token = this.consume();
    if (token.type !== type) {
      throw new BadRequestException(`Formula invalida: esperado ${type}, encontrado "${token.value}"`);
    }
    return token;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek().type === 'OP' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const rhs = this.parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    while (this.peek().type === 'OP' && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.consume().value;
      const rhs = this.parseFactor();
      if (op === '/' && rhs === 0) {
        throw new BadRequestException('Formula resultou em divisao por zero');
      }
      value = op === '*' ? value * rhs : value / rhs;
    }
    return value;
  }

  private parseFactor(): number {
    const token = this.peek();
    if (token.type === 'OP' && token.value === '-') {
      this.consume();
      return -this.parseFactor();
    }
    if (token.type === 'NUMBER') {
      this.consume();
      return Number(token.value);
    }
    if (token.type === 'IDENTIFIER') {
      this.consume();
      if (!(token.value in this.values)) {
        throw new BadRequestException(`Valor ausente para a variavel "${token.value}"`);
      }
      return this.values[token.value];
    }
    if (token.type === 'LPAREN') {
      this.consume();
      const value = this.parseExpression();
      this.expect('RPAREN');
      return value;
    }
    throw new BadRequestException(`Formula invalida proxima a: "${token.value}"`);
  }
}

export function evaluateFormula(expression: string, values: Record<string, number>): number {
  const tokens = tokenize(expression);
  const result = new Parser(tokens, values).parse();
  if (!Number.isFinite(result)) {
    throw new BadRequestException('Formula produziu um resultado invalido (nao finito)');
  }
  return result;
}

export function checkCompliance(calculatedValue: number, operator: GoalOperator, goalValue: number): boolean {
  switch (operator) {
    case GoalOperator.GTE:
      return calculatedValue >= goalValue;
    case GoalOperator.LTE:
      return calculatedValue <= goalValue;
    case GoalOperator.GT:
      return calculatedValue > goalValue;
    case GoalOperator.LT:
      return calculatedValue < goalValue;
    case GoalOperator.EQ:
      return calculatedValue === goalValue;
    default:
      return false;
  }
}
