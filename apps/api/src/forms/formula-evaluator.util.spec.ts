import { BadRequestException } from '@nestjs/common';
import { GoalOperator } from '@prisma/client';
import { checkCompliance, evaluateFormula } from './formula-evaluator.util';

describe('evaluateFormula', () => {
  test('evaluates the canonical percentage formula from the spec', () => {
    expect(evaluateFormula('(A/(A+B))*100', { A: 8, B: 2 })).toBeCloseTo(80);
  });

  test('respects operator precedence without parentheses', () => {
    expect(evaluateFormula('A+B*C', { A: 1, B: 2, C: 3 })).toBe(7);
  });

  test('handles unary minus', () => {
    expect(evaluateFormula('-A+10', { A: 3 })).toBe(7);
  });

  test('handles decimal literals', () => {
    expect(evaluateFormula('A*1.5', { A: 4 })).toBe(6);
  });

  test('throws BadRequestException on division by zero', () => {
    expect(() => evaluateFormula('A/B', { A: 1, B: 0 })).toThrow(BadRequestException);
  });

  test('throws BadRequestException when a required variable value is missing', () => {
    expect(() => evaluateFormula('A+B', { A: 1 })).toThrow(BadRequestException);
  });

  test('throws BadRequestException on malformed expressions', () => {
    expect(() => evaluateFormula('A+*B', { A: 1, B: 2 })).toThrow(BadRequestException);
    expect(() => evaluateFormula('(A+B', { A: 1, B: 2 })).toThrow(BadRequestException);
  });
});

describe('checkCompliance', () => {
  test.each([
    [95, GoalOperator.GTE, 90, true],
    [85, GoalOperator.GTE, 90, false],
    [5, GoalOperator.LTE, 10, true],
    [15, GoalOperator.LTE, 10, false],
    [10, GoalOperator.EQ, 10, true],
    [11, GoalOperator.EQ, 10, false],
    [11, GoalOperator.GT, 10, true],
    [9, GoalOperator.LT, 10, true],
  ])('calculatedValue=%p operator=%p goalValue=%p -> %p', (calculatedValue, operator, goalValue, expected) => {
    expect(checkCompliance(calculatedValue as number, operator as GoalOperator, goalValue as number)).toBe(expected);
  });
});
