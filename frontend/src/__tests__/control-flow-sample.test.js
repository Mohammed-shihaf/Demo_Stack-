import { describe, it, expect } from 'vitest';
import { parseStrictInteger, sumUntilThreshold, classifyDisbursementBatch } from '../utils/control-flow-sample.js';

describe('control-flow-sample utility', () => {
  it('rejects empty input via the early-exit path', () => {
    const result = parseStrictInteger('');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('empty-input');
  });

  it('parses a valid integer via the normal-return path', () => {
    const result = parseStrictInteger('42');
    expect(result.ok).toBe(true);
    expect(result.value).toBe(42);
  });

  it('catches a non-numeric string via the exception path', () => {
    const result = parseStrictInteger('not-a-number');
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Not an integer');
  });

  it('runs the summing loop zero times on empty input', () => {
    const result = sumUntilThreshold([], 10);
    expect(result.sum).toBe(0);
    expect(result.stoppedEarly).toBe(false);
    expect(result.itemsSeen).toBe(0);
  });

  it('runs the summing loop to completion without crossing the threshold', () => {
    const result = sumUntilThreshold([1, 2, 3], 100);
    expect(result.sum).toBe(6);
    expect(result.stoppedEarly).toBe(false);
  });

  it('stops the summing loop early once the threshold is crossed', () => {
    const result = sumUntilThreshold([10, 10, 10, 10], 15);
    expect(result.stoppedEarly).toBe(true);
    expect(result.sum).toBeGreaterThanOrEqual(15);
  });

  it('classifies emergency out-of-state disbursements', () => {
    expect(classifyDisbursementBatch(6000, true, 'out-of-state')).toBe('expedited-emergency-oos');
    expect(classifyDisbursementBatch(1000, true, 'out-of-state')).toBe('standard-emergency-oos');
  });

  it('classifies emergency in-state disbursements', () => {
    expect(classifyDisbursementBatch(15000, true, 'in-state')).toBe('expedited-emergency-instate');
    expect(classifyDisbursementBatch(2000, true, 'in-state')).toBe('standard-emergency-instate');
  });

  it('classifies routine out-of-state disbursements', () => {
    expect(classifyDisbursementBatch(20000, false, 'out-of-state')).toBe('review-required-oos');
    expect(classifyDisbursementBatch(1000, false, 'out-of-state')).toBe('routine-oos');
  });

  it('classifies routine in-state disbursements', () => {
    expect(classifyDisbursementBatch(30000, false, 'in-state')).toBe('review-required-instate');
    expect(classifyDisbursementBatch(1000, false, 'in-state')).toBe('routine-instate');
  });

  it('rejects a non-positive amount', () => {
    expect(() => classifyDisbursementBatch(0, false, 'in-state')).toThrow(RangeError);
  });
});
