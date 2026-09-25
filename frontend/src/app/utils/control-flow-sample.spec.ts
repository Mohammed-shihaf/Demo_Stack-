import { describe, it, expect } from 'vitest';
import { parseStrictInteger, sumUntilThreshold, classifyShipment } from './control-flow-sample';

describe('control-flow-sample utility (frontend)', () => {
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

  it('classifies a fragile international shipment', () => {
    expect(classifyShipment(15, true, 'international')).toBe('freight-fragile-intl');
    expect(classifyShipment(5, true, 'international')).toBe('priority-fragile-intl');
  });

  it('classifies a fragile domestic shipment', () => {
    expect(classifyShipment(25, true, 'domestic')).toBe('freight-fragile-domestic');
    expect(classifyShipment(5, true, 'domestic')).toBe('priority-fragile-domestic');
  });

  it('classifies a non-fragile international shipment', () => {
    expect(classifyShipment(35, false, 'international')).toBe('freight-intl');
    expect(classifyShipment(5, false, 'international')).toBe('standard-intl');
  });

  it('classifies a non-fragile domestic shipment', () => {
    expect(classifyShipment(60, false, 'domestic')).toBe('freight-domestic');
    expect(classifyShipment(5, false, 'domestic')).toBe('standard-domestic');
  });

  it('rejects a non-positive weight', () => {
    expect(() => classifyShipment(0, false, 'domestic')).toThrow(RangeError);
  });
});
