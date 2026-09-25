const assert = require('assert');
const { parseStrictInteger, sumUntilThreshold, classifyHealthCheckLatency } = require('../src/control-flow-sample');

describe('Control Flow Sample Utility Tests', () => {
  it('rejects empty input via the early-exit path', () => {
    const result = parseStrictInteger('');
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.reason, 'empty-input');
  });

  it('parses a valid integer via the normal-return path', () => {
    const result = parseStrictInteger('42');
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.value, 42);
  });

  it('catches a non-numeric string via the exception path', () => {
    const result = parseStrictInteger('not-a-number');
    assert.strictEqual(result.ok, false);
    assert.ok(result.reason.includes('Not an integer'));
  });

  it('runs the summing loop zero times on empty input', () => {
    const result = sumUntilThreshold([], 10);
    assert.strictEqual(result.sum, 0);
    assert.strictEqual(result.stoppedEarly, false);
    assert.strictEqual(result.itemsSeen, 0);
  });

  it('runs the summing loop to completion without crossing the threshold', () => {
    const result = sumUntilThreshold([1, 2, 3], 100);
    assert.strictEqual(result.sum, 6);
    assert.strictEqual(result.stoppedEarly, false);
  });

  it('stops the summing loop early once the threshold is crossed', () => {
    const result = sumUntilThreshold([10, 10, 10, 10], 15);
    assert.strictEqual(result.stoppedEarly, true);
    assert.ok(result.sum >= 15);
  });

  it('classifies degraded-mode latency on the secondary region', () => {
    assert.strictEqual(classifyHealthCheckLatency(600, true, 'secondary'), 'critical-secondary');
    assert.strictEqual(classifyHealthCheckLatency(100, true, 'secondary'), 'warning-secondary');
  });

  it('classifies degraded-mode latency on the primary region', () => {
    assert.strictEqual(classifyHealthCheckLatency(400, true, 'primary'), 'critical-primary');
    assert.strictEqual(classifyHealthCheckLatency(100, true, 'primary'), 'warning-primary');
  });

  it('classifies normal-mode latency on the secondary region', () => {
    assert.strictEqual(classifyHealthCheckLatency(1200, false, 'secondary'), 'slow-secondary');
    assert.strictEqual(classifyHealthCheckLatency(100, false, 'secondary'), 'ok-secondary');
  });

  it('classifies normal-mode latency on the primary region', () => {
    assert.strictEqual(classifyHealthCheckLatency(900, false, 'primary'), 'slow-primary');
    assert.strictEqual(classifyHealthCheckLatency(100, false, 'primary'), 'ok-primary');
  });

  it('rejects a negative latency value', () => {
    assert.throws(() => classifyHealthCheckLatency(-1, false, 'primary'), RangeError);
  });
});
