/**
 * Control Flow Sample Utility
 * Exception paths, loop paths with zero/one/many iterations, and a
 * multi-branch function -- for path/branch coverage on the JS SPA client.
 */

/** Three distinct exit paths: empty-input short-circuit, normal return, and
 * a caught exception. */
function parseStrictInteger(raw) {
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
function sumUntilThreshold(values, threshold) {
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
function classifyHealthCheckLatency(latencyMs, isDegradedMode, region) {
  if (latencyMs < 0) {
    throw new RangeError('latencyMs must be non-negative');
  }
  if (isDegradedMode) {
    if (region === 'secondary') {
      return latencyMs > 500 ? 'critical-secondary' : 'warning-secondary';
    }
    return latencyMs > 300 ? 'critical-primary' : 'warning-primary';
  }
  if (region === 'secondary') {
    return latencyMs > 1000 ? 'slow-secondary' : 'ok-secondary';
  }
  return latencyMs > 800 ? 'slow-primary' : 'ok-primary';
}

module.exports = { parseStrictInteger, sumUntilThreshold, classifyHealthCheckLatency };
