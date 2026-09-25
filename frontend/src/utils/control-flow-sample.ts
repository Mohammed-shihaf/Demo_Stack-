/**
 * Control Flow Sample Utility (TypeScript)
 * Exception paths, loop paths with zero/one/many iterations, and a
 * multi-branch function -- for path/branch coverage and complexity metrics.
 */

export interface ParseResult {
  ok: boolean;
  value?: number;
  reason?: string;
}

/** Three distinct exit paths: empty-input short-circuit, normal return, and
 * a caught exception. */
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

/** Loop body may run zero, one, or many times depending on input. */
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

/** Nested conditionals with real branching depth. */
export function classifyBookingRequest(classSizeRequested: number, isWaitlisted: boolean, membershipTier: string): string {
  if (classSizeRequested <= 0) {
    throw new RangeError('classSizeRequested must be positive');
  }
  if (isWaitlisted) {
    if (membershipTier === 'premium') {
      return classSizeRequested > 1 ? 'priority-waitlist-group' : 'priority-waitlist-single';
    }
    return classSizeRequested > 1 ? 'standard-waitlist-group' : 'standard-waitlist-single';
  }
  if (membershipTier === 'premium') {
    return classSizeRequested > 4 ? 'confirm-group-premium' : 'confirm-solo-premium';
  }
  return classSizeRequested > 4 ? 'confirm-group-standard' : 'confirm-solo-standard';
}
