/**
 * Control Flow Sample Utility
 * Exception paths, loop paths with zero/one/many iterations, and a
 * multi-branch function -- for path/branch coverage and complexity metrics.
 */

/** Three distinct exit paths: empty-input short-circuit, normal return, and
 * a caught exception. */
export function parseStrictInteger(raw) {
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
    return { ok: false, reason: err.message }; // path 3
  }
}

/** Loop body may run zero, one, or many times depending on input. */
export function sumUntilThreshold(values, threshold) {
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
export function classifyMaintenanceRequest(estimatedCost, isEmergency, propertyType) {
  if (estimatedCost <= 0) {
    throw new RangeError('estimatedCost must be positive');
  }
  if (isEmergency) {
    if (propertyType === 'commercial') {
      return estimatedCost > 5000 ? 'dispatch-contractor-commercial' : 'dispatch-inhouse-commercial';
    }
    return estimatedCost > 2000 ? 'dispatch-contractor-residential' : 'dispatch-inhouse-residential';
  }
  if (propertyType === 'commercial') {
    return estimatedCost > 15000 ? 'approval-required-commercial' : 'schedule-routine-commercial';
  }
  return estimatedCost > 8000 ? 'approval-required-residential' : 'schedule-routine-residential';
}
