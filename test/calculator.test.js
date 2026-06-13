"use strict";

const script = require('../calculator/assets/js/script.js');
const { normalizeExpression, calculateExpression, LAST_RESULT } = script;

describe('Calculator Expression Normalization', () => {
  test('should convert asin to asinDeg', () => {
    expect(normalizeExpression('asin(30)')).toBe('asinDeg(30)');
  });

  test('should convert acos to acosDeg', () => {
    expect(normalizeExpression('acos(45)')).toBe('acosDeg(45)');
  });

  test('should convert atan to atanDeg', () => {
    expect(normalizeExpression('atan(60)')).toBe('atanDeg(60)');
  });

  test('should convert sin to sinDeg', () => {
    expect(normalizeExpression('sin(30)')).toBe('sinDeg(30)');
  });

  test('should convert cos to cosDeg', () => {
    expect(normalizeExpression('cos(45)')).toBe('cosDeg(45)');
  });

  test('should convert tan to tanDeg', () => {
    expect(normalizeExpression('tan(60)')).toBe('tanDeg(60)');
  });

  test('should convert e to Math.E', () => {
    expect(normalizeExpression('2 * e')).toBe('2 * Math.E');
  });

  test('should convert pi to Math.PI', () => {
    expect(normalizeExpression('2 * pi')).toBe('2 * Math.PI');
  });

  test('should handle multiple replacements', () => {
    expect(normalizeExpression('sin(30) + cos(45) * e')).toBe('sinDeg(30) + cosDeg(45) * Math.E');
  });
});

describe('Calculator Expression Evaluation', () => {
  beforeEach(() => {
    globalThis.LAST_RESULT = 0;
  });

  test('should evaluate simple addition', () => {
    expect(calculateExpression('2 + 3', 0)).toBe(5);
  });

  test('should evaluate simple subtraction', () => {
    expect(calculateExpression('10 - 4', 0)).toBe(6);
  });

  test('should evaluate multiplication', () => {
    expect(calculateExpression('3 * 4', 0)).toBe(12);
  });

  test('should evaluate division', () => {
    expect(calculateExpression('20 / 5', 0)).toBe(4);
  });

  test('should evaluate exponentiation', () => {
    expect(calculateExpression('2 ** 3', 0)).toBe(8);
  });

  test('should evaluate parentheses', () => {
    expect(calculateExpression('(2 + 3) * 4', 0)).toBe(20);
  });

  test('should evaluate with decimal numbers', () => {
    expect(calculateExpression('3.5 * 2', 0)).toBe(7);
  });

  test('should handle ans replacement', () => {
    globalThis.LAST_RESULT = 5;
    expect(calculateExpression('ans + 3', 5)).toBe(8);
  });

  test('should handle ans replacement with multiple occurrences', () => {
    globalThis.LAST_RESULT = 10;
    expect(calculateExpression('ans * 2 + ans', 10)).toBe(30);
  });

  test('should return Error for invalid expression', () => {
    expect(calculateExpression('2 / 0', 0)).toBe('Error');
  });

  test('should return Error for division by zero', () => {
    expect(calculateExpression('1 / 0', 0)).toBe('Error');
  });

  test('should return Error for invalid syntax', () => {
    expect(calculateExpression('2 + * 3', 0)).toBe('Error');
  });

  test('should return Error for NaN result', () => {
    expect(calculateExpression('0 / 0', 0)).toBe('Error');
  });

  test('should return Error for Infinity result', () => {
    expect(calculateExpression('1 / 0', 0)).toBe('Error');
  });

  test('should handle operator precedence (multiplication before addition)', () => {
    expect(calculateExpression('2 + 3 * 4', 0)).toBe(14);
  });

  test('should handle nested parentheses', () => {
    expect(calculateExpression('(2 + (3 * 4))', 0)).toBe(14);
  });

  test('should handle modulo operator', () => {
    expect(calculateExpression('10 % 3', 0)).toBe(1);
  });

  test('should handle exponentiation with negative base', () => {
    expect(calculateExpression('-2 ** 2', 0)).toBe(4);
  });

  test('should handle multiple subtraction', () => {
    expect(calculateExpression('10 - 5 - 2', 0)).toBe(3);
  });

  test('should handle consecutive unary operators', () => {
    expect(calculateExpression('--5', 0)).toBe(5);
  });

  test('should evaluate empty expression as Error', () => {
    expect(calculateExpression('', 0)).toBe('Error');
  });

  test('should evaluate whitespace expression as Error', () => {
    expect(calculateExpression('   ', 0)).toBe('Error');
  });
});

describe('Calculator Edge Cases', () => {
  test('should handle empty expression', () => {
    expect(calculateExpression('')).toBe('Error');
  });

  test('should handle single number', () => {
    expect(calculateExpression('42')).toBe(42);
  });

  test('should handle negative numbers', () => {
    expect(calculateExpression('-5 + 3')).toBe(-2);
  });

  test('should handle scientific notation', () => {
    expect(calculateExpression('1e3 + 2e2')).toBe(1200);
  });

  test('should handle square root function', () => {
    expect(calculateExpression('sqrt(9)')).toBe(3);
  });

  test('should handle absolute value', () => {
    expect(calculateExpression('abs(-5)')).toBe(5);
  });
});
