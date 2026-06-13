"use strict";

const script = require('../calculator/assets/js/script.js');

describe('Calculator Functions from script.js', () => {
  beforeEach(() => {
    script.LAST_RESULT = 0;
  });

  test('should evaluate simple addition', () => {
    expect(script.calculateExpression('2 + 3', script.LAST_RESULT)).toBe(5);
  });

  test('should evaluate simple subtraction', () => {
    expect(script.calculateExpression('10 - 4', script.LAST_RESULT)).toBe(6);
  });

  test('should evaluate multiplication', () => {
    expect(script.calculateExpression('3 * 4', script.LAST_RESULT)).toBe(12);
  });

  test('should evaluate division', () => {
    expect(script.calculateExpression('20 / 5', script.LAST_RESULT)).toBe(4);
  });

  test('should evaluate exponentiation', () => {
    expect(script.calculateExpression('2 ** 3', script.LAST_RESULT)).toBe(8);
  });

  test('should evaluate parentheses', () => {
    expect(script.calculateExpression('(2 + 3) * 4', script.LAST_RESULT)).toBe(20);
  });

  test('should evaluate with decimal numbers', () => {
    expect(script.calculateExpression('3.5 * 2', script.LAST_RESULT)).toBe(7);
  });

  test('should handle ans replacement', () => {
    script.LAST_RESULT = 5;
    expect(script.calculateExpression('ans + 3', script.LAST_RESULT)).toBe(8);
  });

  test('should handle ans replacement with multiple occurrences', () => {
    script.LAST_RESULT = 10;
    expect(script.calculateExpression('ans * 2 + ans', script.LAST_RESULT)).toBe(30);
  });

  test('should return Error for invalid expression', () => {
    expect(script.calculateExpression('2 / 0', script.LAST_RESULT)).toBe('Error');
  });

  test('should return Error for division by zero', () => {
    expect(script.calculateExpression('1 / 0', script.LAST_RESULT)).toBe('Error');
  });

  test('should return Error for invalid syntax', () => {
    expect(script.calculateExpression('2 + * 3', script.LAST_RESULT)).toBe('Error');
  });

  test('should return Error for NaN result', () => {
    expect(script.calculateExpression('0 / 0', script.LAST_RESULT)).toBe('Error');
  });

  test('should return Error for Infinity result', () => {
    expect(script.calculateExpression('1 / 0', script.LAST_RESULT)).toBe('Error');
  });
});

describe('UI Functions', () => {
  beforeEach(() => {
    document.body.innerHTML = '<input id="result" value="0" />';
    script.currentExpression = '';
    script.LAST_RESULT = 0;
  });

  test('appendToResult should add value to expression', () => {
    script.appendToResult('5');
    expect(script.currentExpression).toBe('5');
  });

  test('appendToResult should chain multiple values', () => {
    script.appendToResult('1');
    script.appendToResult('2');
    script.appendToResult('3');
    expect(script.currentExpression).toBe('123');
  });

  test('appendToResult should update the display', () => {
    script.appendToResult('42');
    expect(document.getElementById('result').value).toBe('42');
  });

  test('backspace should remove last character', () => {
    script.appendToResult('123');
    script.backspace();
    expect(script.currentExpression).toBe('12');
  });

  test('backspace on empty expression should do nothing', () => {
    script.backspace();
    expect(script.currentExpression).toBe('');
  });

  test('clearResult should clear expression', () => {
    script.appendToResult('123');
    script.clearResult();
    expect(script.currentExpression).toBe('');
  });

  test('clearResult should reset display to 0', () => {
    script.appendToResult('123');
    script.clearResult();
    expect(document.getElementById('result').value).toBe('0');
  });

  test('bracketToResult should add bracket', () => {
    script.bracketToResult('(');
    expect(script.currentExpression).toBe('(');
  });

  test('operatorToResult should add operator', () => {
    script.operatorToResult('+');
    expect(script.currentExpression).toBe('+');
  });

  test('operatorToResult should convert ^ to **', () => {
    script.operatorToResult('^');
    expect(script.currentExpression).toBe('**');
  });

  test('calculateResult should evaluate expression and update display', () => {
    script.appendToResult('2');
    script.operatorToResult('+');
    script.appendToResult('3');
    script.calculateResult();
    expect(document.getElementById('result').value).toBe('5');
    expect(script.LAST_RESULT).toBe('5');
  });

  test('calculateResult with percent should work', () => {
    script.appendToResult('200');
    script.percentToResult();
    expect(script.currentExpression).toBe('2*');
  });

  test('percentToResult on simple number calculates percentage', () => {
    script.appendToResult('50');
    script.percentToResult();
    expect(script.currentExpression).toBe('0.5*');
  });

  test('updateResult sets display to 0 when expression is empty', () => {
    script.currentExpression = '';
    script.updateResult();
    expect(document.getElementById('result').value).toBe('0');
  });
});
