'use strict';

/**
 * Deliberate control-flow fixtures: exception paths, loop paths with zero and
 * multiple iterations, and a multi-branch function -- each exercised by the
 * matching test in ControlFlowSampleService.test.js so path/branch coverage
 * tools have real execution traces, not just source to parse.
 */
class ControlFlowSampleService {
  /**
   * Three distinct exit paths: normal return, caught exception, and a
   * zero-length input short-circuit -- for exception-path handling and
   * multi-function path tracking.
   */
  static parseStrictInteger(raw) {
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
      return { ok: false, reason: err.message }; // path 3 (exception path)
    }
  }

  /**
   * A loop whose body may run zero, one, or many times depending on input --
   * for loop-path detection and complete-coverage-path verification, driven
   * by three separate test cases (empty, single, many).
   */
  static sumUntilThreshold(values, threshold) {
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

  /**
   * Nested conditionals with real branching depth, for cyclomatic/cognitive
   * complexity metrics and CI/CD-integration-style path testing.
   */
  static classifyShipment(weightKg, isFragile, destinationZone) {
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
}

module.exports = ControlFlowSampleService;
