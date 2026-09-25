import { describe, it, expect } from 'vitest';
import { parseStrictInteger, sumUntilThreshold, classifyMaintenanceRequest } from '../utils/control-flow-sample.js';

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

  it('classifies emergency commercial maintenance requests', () => {
    expect(classifyMaintenanceRequest(6000, true, 'commercial')).toBe('dispatch-contractor-commercial');
    expect(classifyMaintenanceRequest(1000, true, 'commercial')).toBe('dispatch-inhouse-commercial');
  });

  it('classifies emergency residential maintenance requests', () => {
    expect(classifyMaintenanceRequest(3000, true, 'residential')).toBe('dispatch-contractor-residential');
    expect(classifyMaintenanceRequest(500, true, 'residential')).toBe('dispatch-inhouse-residential');
  });

  it('classifies routine commercial maintenance requests', () => {
    expect(classifyMaintenanceRequest(20000, false, 'commercial')).toBe('approval-required-commercial');
    expect(classifyMaintenanceRequest(1000, false, 'commercial')).toBe('schedule-routine-commercial');
  });

  it('classifies routine residential maintenance requests', () => {
    expect(classifyMaintenanceRequest(10000, false, 'residential')).toBe('approval-required-residential');
    expect(classifyMaintenanceRequest(500, false, 'residential')).toBe('schedule-routine-residential');
  });

  it('rejects a non-positive cost', () => {
    expect(() => classifyMaintenanceRequest(0, false, 'residential')).toThrow(RangeError);
  });
});
