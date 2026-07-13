import { BadRequestException } from '@nestjs/common';
import { validateFormulaExpression } from './formula-validator.util';

describe('validateFormulaExpression', () => {
  test('accepts a formula that only references declared keys', () => {
    expect(() => validateFormulaExpression('(A/(A+B))*100', ['A', 'B'])).not.toThrow();
  });

  test('rejects a formula referencing an undeclared key', () => {
    expect(() => validateFormulaExpression('(A/(A+C))*100', ['A', 'B'])).toThrow(BadRequestException);
  });

  test('rejects a formula containing disallowed characters', () => {
    expect(() => validateFormulaExpression('A; DROP TABLE users;', ['A'])).toThrow(BadRequestException);
  });

  test('accepts a formula with decimal numeric literals', () => {
    expect(() => validateFormulaExpression('A * 1.5 + B', ['A', 'B'])).not.toThrow();
  });
});
