/**
 * Control Flow Sample Utility (TypeScript / Frontend)
 * Exception paths, loop paths with zero/one/many iterations, and a
 * multi-branch function -- each exercised by a dedicated spec so path and
 * branch coverage tools have real execution traces, not just source to parse.
 */

export interface ParseResult {
  ok: boolean;
  value?: number;
  reason?: string;
}

/** Three distinct exit paths: empty-input short-circuit, normal return, and
 * a caught exception -- for exception-path handling and multi-function path
 * tracking. */
export function parseStrictInteger(raw: string): ParseResult {
  if (raw === '' || raw === null || raw === undefined) {
    return { ok: false, reason: 'empty-input' }; // path 1
  }
  try {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) {
      throw new Error(`Not an integer: ${raw}`);
    }
    return { ok: true, value: n }; // path 2
  } catch (err) {
    return { ok: false, reason: (err as Error).message }; // path 3
  }
}

export interface SumResult {
  sum: number;
  stoppedEarly: boolean;
  itemsSeen: number;
}

/** Loop body may run zero, one, or many times depending on input -- for
 * loop-path detection and complete-coverage-path verification. */
export function sumUntilThreshold(values: number[], threshold: number): SumResult {
  let sum = 0;
  let stoppedEarly = false;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (sum >= threshold) {
      stoppedEarly = true;
      break;
    }
  }
  return { sum, stoppedEarly, itemsSeen: values.length };
}

/** Nested conditionals with real branching depth, for cyclomatic/cognitive
 * complexity metrics. */
export function classifyShipment(weightKg: number, isFragile: boolean, destinationZone: string): string {
  if (weightKg <= 0) {
    throw new RangeError('weightKg must be positive');
  }
  if (isFragile) {
    if (destinationZone === 'international') {
      return weightKg > 10 ? 'freight-fragile-intl' : 'priority-fragile-intl';
    }
    return weightKg > 20 ? 'freight-fragile-domestic' : 'priority-fragile-domestic';
  }
  if (destinationZone === 'international') {
    return weightKg > 30 ? 'freight-intl' : 'standard-intl';
  }
  return weightKg > 50 ? 'freight-domestic' : 'standard-domestic';
}
