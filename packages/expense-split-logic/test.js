import test from 'node:test';
import assert from 'node:assert';
import { distributeExactly, calculateOwedAmounts, validateSplit } from './index.js';

test('distributeExactly handles uneven splits', () => {
  const result = distributeExactly(100, 3);
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[0], 33.34);
  assert.strictEqual(result[1], 33.33);
  assert.strictEqual(result[2], 33.33);
  assert.strictEqual(result.reduce((a, b) => a + b), 100);
});

test('calculateOwedAmounts - equal split', () => {
  const participants = [
    { userId: '1', splitValue: 1 },
    { userId: '2', splitValue: 1 },
    { userId: '3', splitValue: 1 }
  ];
  const result = calculateOwedAmounts(100, 'equal', participants);
  assert.strictEqual(result[0].owedAmount, 33.34);
  assert.strictEqual(result[1].owedAmount, 33.33);
  assert.strictEqual(result[2].owedAmount, 33.33);
});

test('calculateOwedAmounts - unequal split', () => {
  const participants = [
    { userId: '1', splitValue: 50 },
    { userId: '2', splitValue: 50 }
  ];
  const result = calculateOwedAmounts(100, 'unequal', participants);
  assert.strictEqual(result[0].owedAmount, 50);
  assert.strictEqual(result[1].owedAmount, 50);
});

test('calculateOwedAmounts - shares split', () => {
  const participants = [
    { userId: '1', splitValue: 2 },
    { userId: '2', splitValue: 1 }
  ];
  const result = calculateOwedAmounts(100, 'shares', participants);
  assert.strictEqual(result[0].owedAmount, 66.67);
  assert.strictEqual(result[1].owedAmount, 33.33);
});

test('validateSplit works correctly', () => {
  const participants = [
    { paidAmount: 50, owedAmount: 60 },
    { paidAmount: 50, owedAmount: 40 }
  ];
  assert.doesNotThrow(() => validateSplit(100, participants));
});

test('validateSplit throws on mismatch', () => {
  const participants = [
    { paidAmount: 50, owedAmount: 60 },
    { paidAmount: 40, owedAmount: 40 } // Paid 90 instead of 100
  ];
  assert.throws(() => validateSplit(100, participants), /Integrity Error/);
});
